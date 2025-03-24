import React, { useState, useRef, useEffect } from "react";
import { View, PanResponder, Text, Alert, Image, Button } from "react-native";
import { Canvas, Path, SkPath, Skia, useCanvasRef, PaintStyle } from "@shopify/react-native-skia";
import { ImageFormat } from "@shopify/react-native-skia";
import RNFS from 'react-native-fs'

const width = 512;
const height = 512;
const strokeWidth = 5;
const strokeColor = "blue";

// const SOCKET_URL = "ws://10.100.102.13:5283/ws/img2img"; // Replace with your WebSocket API


function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary); // You might need a polyfill for `btoa` in some environments
}

const PaintDemo = () => {
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [outputImage, setOutputImage] = useState<string | null>(null); // Store server image
  const canvasRef = useCanvasRef(); // Skia Canvas reference
  const currentPath = useRef<SkPath | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [snapshotDataUri, setSnapshotDataUri] = useState<string | null>(null);
  console.log(snapshotDataUri)
  const makeSnapshot = () => {
    // Create offscreen surface
    const surface = Skia.Surface.MakeOffscreen(width, height);
    const canvas = surface?.getCanvas();

    // Background
    const bgPaint = Skia.Paint();
    bgPaint.setStyle(PaintStyle.Fill);
    bgPaint.setColor(Skia.Color("white")); // or "black"
    canvas?.drawRect({ x: 0, y: 0, width, height }, bgPaint);

    // Strokes
    const paint = Skia.Paint();
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(strokeWidth);
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color(strokeColor));

    // Draw each path
    paths.forEach((p) => {
      canvas?.drawPath(p, paint);
    });

    // Snapshot
    const image = surface?.makeImageSnapshot();
    if (image) {
      const pngBytes = image.encodeToBytes(ImageFormat.PNG);
      // Convert to base64 and store in state for preview
      const base64Image = arrayBufferToBase64(pngBytes.buffer);
      setSnapshotDataUri(`data:image/png;base64,${base64Image}`);
    }
  };

  useEffect(() => {
    makeSnapshot();
  }, [paths]);

  // useEffect(() => {
  //   if (socketRef.current) {
  //     if (socketRef.current) {
  //       sendDrawingAsPNG();
  //     }
  //   }
  // }, [paths.length]);

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

  // const sendDrawingAsPNG = async () => {
  //   if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
  //     console.warn("WebSocket not open");
  //     return;
  //   }
  //   console.log("here", paths)
  //   // Create offscreen surface
  //   const surface = Skia.Surface.MakeOffscreen(width, height);
  //   const canvas = surface?.getCanvas();

  //   // Draw all paths to the offscreen canvas
  //   try {
  //     const bgPaint = Skia.Paint();
  //     bgPaint.setStyle(PaintStyle.Fill);
  //     bgPaint.setColor(Skia.Color('black'));
  //     canvas?.drawRect({ x: 0, y: 0, width, height }, bgPaint);

  //     const paint = Skia.Paint();
  //     paint.setStyle(PaintStyle.Stroke);
  //     paint.setStrokeWidth(strokeWidth);
  //     paint.setAntiAlias(true);
  //     paint.setColor(Skia.Color(strokeColor));

  //     const realPaths = Array.from(paths);
  //     realPaths.forEach((path, i) => {
  //       canvas?.drawPath(path, paint);
  //     });

  //   }
  //   catch (e) { console.log(e) }

  //   const image = surface?.makeImageSnapshot();
  //   const pngBytes = image?.encodeToBytes(ImageFormat.PNG);
  //   const path = `${RNFS.DownloadDirectoryPath}/my-image${Math.random()}.png`;
  //   const base64Image = arrayBufferToBase64(pngBytes.buffer);
  //   try {
  //     await RNFS.writeFile(path, base64Image, 'base64');
  //   } catch (err) {
  //     console.error('Error saving image:', err);
  //   }
  //   if (pngBytes) {
  //     socketRef.current.send(pngBytes.buffer);
  //     socketRef.current.send(JSON.stringify({
  //       "prompt": "realistic clouds,realistic sun",
  //       "server_noise": true,
  //       "image_format": "png",
  //       "t_steps": [16]
  //     }))
  //     console.log("🖼️ PNG sent to server");
  //   } else {
  //     console.warn("⚠️ Failed to encode image");
  //   }
  // };

  // 📡 Connect to WebSocket
  // const connectWebSocket = () => {
  //   socketRef.current = new WebSocket(SOCKET_URL);

  //   socketRef.current.onopen = () => {
  //     console.log("✅ WebSocket connected!");
  //   };

  //   socketRef.current.onmessage = (event) => {
  //     // Assume the server sends binary image data
  //     const rawData = event.data
  //     if (rawData instanceof ArrayBuffer) {
  //       // Convert ArrayBuffer to a typed array
  //       const bytes = new Uint8Array(rawData);

  //       // Convert the bytes to a binary string
  //       let binaryString = '';
  //       for (let i = 0; i < bytes.byteLength; i++) {
  //         binaryString += String.fromCharCode(bytes[i]);
  //       }
  //       // Encode that binary string to base64
  //       const base64String = btoa(binaryString);

  //       // Make a data URI for an <Image> component
  //       setOutputImage(`data:image/png;base64,${base64String}`);
  //     }
  //   };

  //   socketRef.current.onerror = (error) => {
  //     console.error("❌ WebSocket Error:", error);
  //   };

  //   socketRef.current.onclose = () => {
  //     console.log("⚠️ WebSocket Disconnected!");
  //   };
  // };

  // // 🔌 Establish WebSocket connection on component mount
  // useEffect(() => {
  //   connectWebSocket();
  //   return () => {
  //     if (socketRef.current) {
  //       console.log("Closing WebSocket...")
  //       socketRef.current.close();
  //       console.log("WebSocket closed")
  //     }
  //   };
  // }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} >
      <Text>🎨 Draw something! (Auto-saving & sending every 5 seconds)</Text>

      {/* Skia Canvas */}
      <Canvas ref={canvasRef} style={{ width, height, backgroundColor: "white" }} {...panResponder.panHandlers}>
        {paths.map((p, index) => (
          <Path key={index} path={p} color={strokeColor} style="stroke" strokeWidth={strokeWidth} />
        ))}
      </Canvas>
      {/* <Button title="Send Drawing to Server" onPress={sendDrawingAsPNG} /> */}
      <Button title="clear" onPress={() => setPaths([])} />
      {/* 🔄 Display the image received from the WebSocket */}
      {outputImage && (
        <Image
          source={{ uri: outputImage }}
          style={{ width: 512, height: 512, marginTop: 20 }}
        />
      )}
      {snapshotDataUri && (
        <>
          <Text>Preview:</Text>
          <Image
            source={{ uri: snapshotDataUri }}
            style={{ width: width, height: height, marginTop: 8 }}
            resizeMode="contain"
          />
        </>
      )}
    </View>
  );
};

export default PaintDemo;
