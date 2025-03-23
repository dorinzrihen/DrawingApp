import React, { useState, useRef, useEffect } from "react";
import { View, PanResponder, Text, Alert, Image } from "react-native";
import { Canvas, Path, SkPath, Skia, useCanvasRef } from "@shopify/react-native-skia";

const width = 512;
const height = 512;
const strokeWidth = 5;
const strokeColor = "black";

const SOCKET_URL = "ws://10.100.102.13:5283/ws/img2img"; // Replace with your WebSocket API

const PaintDemo = () => {
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [outputImage, setOutputImage] = useState<string | null>(null); // Store server image
  const canvasRef = useCanvasRef(); // Skia Canvas reference
  const currentPath = useRef<SkPath | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // 🖌️ Handle touch gestures for drawing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);
        currentPath.current = newPath;
        setPaths((prevPaths) => [...prevPaths, newPath]);
      },
      onPanResponderMove: (evt) => {
        if (currentPath.current) {
          const { locationX, locationY } = evt.nativeEvent;
          currentPath.current.lineTo(locationX, locationY);
          setPaths((prevPaths) => [...prevPaths]); // Force re-render
        }
      },
      onPanResponderRelease: () => {
        currentPath.current = null;
      },
    })
  ).current;

  // 📡 Connect to WebSocket
  const connectWebSocket = () => {
    socketRef.current = new WebSocket(SOCKET_URL);

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected!");
    };

    socketRef.current.onmessage = (event) => {
      // Assume the server sends binary image data
      const rawData = event.data
      if (rawData instanceof ArrayBuffer) {
        // Convert ArrayBuffer to a typed array
        const bytes = new Uint8Array(rawData);

        // Convert the bytes to a binary string
        let binaryString = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        console.log(bytes.length);
        console.log(bytes.length);
        // Encode that binary string to base64
        const base64String = btoa(binaryString);

        // Make a data URI for an <Image> component
        setOutputImage(`data:image/png;base64,${base64String}`);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("⚠️ WebSocket Disconnected!");
    };
  };

  // 🔌 Establish WebSocket connection on component mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket...")
        socketRef.current.close();
        console.log("WebSocket closed")
      }
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} {...panResponder.panHandlers}>
      <Text>🎨 Draw something! (Auto-saving & sending every 5 seconds)</Text>

      {/* Skia Canvas */}
      <Canvas ref={canvasRef} style={{ width, height, backgroundColor: "white" }}>
        {paths.map((p, index) => (
          <Path key={index} path={p} color={strokeColor} style="stroke" strokeWidth={strokeWidth} />
        ))}
      </Canvas>

      {/* 🔄 Display the image received from the WebSocket */}
      {outputImage && (
        <Image
          source={{ uri: outputImage }}
          style={{ width: 512, height: 512, marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default PaintDemo;
