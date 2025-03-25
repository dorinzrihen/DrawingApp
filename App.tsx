import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, PanResponder, Text, Alert, Image, Button, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import {
  Canvas,
  Path,
  SkPath,
  Skia,
  useCanvasRef,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  ImageFormat
} from "@shopify/react-native-skia";
import RNFS from 'react-native-fs'
import Slider from "@react-native-community/slider";

type Stroke = {
  path: SkPath;
  color: string;
  strokeWidth: number;
};

const width = 512;
const height = 512;
const backgroundColor = "black"

const SOCKET_URL = "ws://10.100.102.13:5283/ws/img2img"; // Replace with your WebSocket API

const circles = [
  { color: "red" },
  { color: "blue" },
  { color: "green" },
  { color: "orange" },
  { color: "white" }
];


function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary); // You might need a polyfill for `btoa` in some environments
}

const PaintDemo = () => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [outputImage, setOutputImage] = useState<string | null>(null); // Store server image
  const canvasRef = useCanvasRef(); // Skia Canvas reference
  const socketRef = useRef<WebSocket | null>(null);
  const currentStroke = useRef<Stroke | null>(null);
  const [snapshotDataUri, setSnapshotDataUri] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("blue")
  const [selectedWidth, setSelectedWidth] = useState(5)
  const [tStep, setTStep] = useState(16)
  const [textValue, setTextValue] = useState("dog");

  const currentProps = useRef({
    color: selectedColor, 
    width: selectedWidth,
    strokes: strokes,
    text: textValue,
    tStep: tStep
  })

  useEffect(() => {
    currentProps.current = {
      color: selectedColor, 
      width: selectedWidth,
      strokes: strokes,
      text: textValue,
      tStep: tStep
    }
  }, [selectedColor, selectedWidth, strokes, textValue, tStep]);

  // const makeSnapshot = () => {
  //   const surface = Skia.Surface.MakeOffscreen(width, height);
  //   const canvas = surface?.getCanvas();

  //   // Draw background
  //   const bgPaint = Skia.Paint();
  //   bgPaint.setStyle(PaintStyle.Fill);
  //   bgPaint.setColor(Skia.Color(backgroundColor));
  //   canvas?.drawRect({ x: 0, y: 0, width, height }, bgPaint);

  //   // Draw each stroke with its own attributes
  //   strokes.forEach(({ path, color, strokeWidth }) => {
  //     const paint = Skia.Paint();
  //     paint.setStyle(PaintStyle.Stroke);
  //     paint.setStrokeWidth(strokeWidth);
  //     paint.setAntiAlias(true);
  //     paint.setStrokeCap(StrokeCap.Round);
  //     paint.setStrokeJoin(StrokeJoin.Round);
  //     paint.setColor(Skia.Color(color));
  //     canvas?.drawPath(path, paint);
  //   });

  //   const image = surface?.makeImageSnapshot();
  //   if (image) {
  //     const pngBytes = image.encodeToBytes(ImageFormat.PNG);
  //     const base64Image = arrayBufferToBase64(pngBytes.buffer);
  //     setSnapshotDataUri(`data:image/png;base64,${base64Image}`);
  //   }
  // };
  useEffect(() => {
    const surface = Skia.Surface.MakeOffscreen(width, height);
    const canvas = surface?.getCanvas();
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setStyle(PaintStyle.Fill);
    backgroundPaint.setColor(Skia.Color(backgroundColor)); // or any color

    canvas?.drawRect({ x: 0, y: 0, width, height }, backgroundPaint);
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        console.log("Finger down on canvas!");
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);

        // Create a stroke with the *current* selected color & width.
        const newStroke: Stroke = {
          path: newPath,
          color: currentProps.current.color,    // uses the color in state at this moment
          strokeWidth: currentProps.current.width,
        };

        currentStroke.current = newStroke;
        setStrokes((prev) => [...prev, newStroke]);
      },
      onPanResponderMove: (evt) => {
        if (currentStroke.current) {
          if (currentStroke.current) {
            currentStroke.current.color = currentProps.current.color;
            currentStroke.current.strokeWidth = currentProps.current.width;
            const { locationX, locationY } = evt.nativeEvent;
            currentStroke.current.path.lineTo(locationX, locationY);
            setStrokes((prev) => [...prev]);
          }
        }
      },
      onPanResponderRelease: () => {
        currentStroke.current = null;
        if (socketRef.current) {
          sendDrawingAsPNG();
        }
      },
    }));

  const sendDrawingAsPNG = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not open");
      return;
    }
    // Create offscreen surface
    const surface = Skia.Surface.MakeOffscreen(width, height);
    const canvas = surface?.getCanvas();

    // Draw all paths to the offscreen canvas
    try {
      const bgPaint = Skia.Paint();
      bgPaint.setStyle(PaintStyle.Fill);
      bgPaint.setColor(Skia.Color('black'));
      canvas?.drawRect({ x: 0, y: 0, width, height }, bgPaint);
      const realPaths = Array.from(currentProps.current.strokes);
      realPaths.forEach((stroke, i) => {
        console.log(i, stroke.color, stroke.strokeWidth)
        const paint = Skia.Paint();
        paint.setStyle(PaintStyle.Stroke);
        paint.setStrokeWidth(stroke.strokeWidth);
        paint.setAntiAlias(true);
        paint.setColor(Skia.Color(stroke.color));
        canvas?.drawPath(stroke.path, paint);
      });

    }
    catch (e) { console.log(e) }

    const image = surface?.makeImageSnapshot();
    const pngBytes = image?.encodeToBytes(ImageFormat.PNG);
    const path = `${RNFS.DownloadDirectoryPath}/my-image${Math.random()}.png`;
    const base64Image = arrayBufferToBase64(pngBytes.buffer);
    try {
      await RNFS.writeFile(path, base64Image, 'base64');
    } catch (err) {
      console.error('Error saving image:', err);
    }
    if (pngBytes) {
      console.log(textValue)
      socketRef.current.send(pngBytes.buffer);
      socketRef.current.send(JSON.stringify({
        "prompt": currentProps.current.text,
        "server_noise": true,
        "image_format": "png",
        "t_steps": [currentProps.current.tStep]
      }))
      console.log("🖼️ PNG sent to server");
    } else {
      console.warn("⚠️ Failed to encode image");
    }
  };

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

  const handleCirclePress = (color) => {
    setSelectedColor(color)
  };

  const handleSizeChange = (newSize) => {
    setSelectedWidth(newSize);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} >
      <View>
        <View style={styles.container}>
          <View>
            <Text>Type Something:</Text>
            <TextInput
              style={styles.input}
              placeholder="Write here..."
              value={textValue} // Controlled by React state
              onChangeText={(newText) => setTextValue(newText)} // Update state when user types
            />
          </View>
          <View>
            <Text>{tStep}px - t step</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={49}
              step={1}
              value={tStep}
              onValueChange={(val) => setTStep(val)}
            />
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.container}>
            {circles.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleCirclePress(item.color)}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50 / 2,
                    backgroundColor: item.color,
                    margin: 10
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View>
            <Text>{selectedWidth}px</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={selectedWidth}
              onValueChange={(val) => handleSizeChange(val)}
            />
          </View>
        </View>
      </View>

      <Canvas ref={canvasRef} style={{ width, height, backgroundColor: backgroundColor }} {...panResponder.current.panHandlers}>
        {strokes.map((stroke, index) => (
          <Path
            key={index}
            path={stroke.path}
            color={stroke.color}
            style="stroke"
            strokeWidth={stroke.strokeWidth}
          />
        ))}
      </Canvas>
      {/* <Button title="Send Drawing to Server" onPress={sendDrawingAsPNG} /> */}
      <Button title="clear" onPress={() => setStrokes([])} />
      {/* 🔄 Display the image received from the WebSocket */}
      {outputImage && (
        <Image
          source={{ uri: outputImage }}
          style={{ width: 512, height: 512, marginTop: 20 }}
        />
      )}
      {/* {snapshotDataUri && (
        <>
          <Text>Preview:</Text>
          <Image
            source={{ uri: snapshotDataUri }}
            style={{ width: width, height: height, marginTop: 8 }}
            resizeMode="contain"
          />
        </>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
    borderRadius: 6,
  },
});

export default PaintDemo;

