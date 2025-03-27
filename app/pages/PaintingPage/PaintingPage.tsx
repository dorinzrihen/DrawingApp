import { Canvas, PaintStyle, Path, Skia, useCanvasRef } from "@shopify/react-native-skia"
import React, { useEffect, useRef, useState } from "react"
import { backgroundColor, height, sendDrawingAsPNG, width } from "./PaintingPageLib"
import { Button, Image, StyleSheet, Text, TextInput, View } from "react-native"
import Slider from "@react-native-community/slider"
import { useDrawing } from "../../hooks/useDrawing"
import Toolbar from "../../components/Toolbar/Toolbar"

const SOCKET_URL = "ws://10.100.102.13:5283/ws/img2img" // Replace with your WebSocket API

const PaintingPage = () => {
  const [outputImage, setOutputImage] = useState<string | null>(null) // Store server image
  const canvasRef = useCanvasRef() // Skia Canvas reference
  const socketRef = useRef<WebSocket | null>(null)
  // const currentStroke = useRef<Stroke | null>(null);

  const [selectedColor, setSelectedColor] = useState("blue")
  const [selectedWidth, setSelectedWidth] = useState(5)
  const [tStep, setTStep] = useState(16)
  const [textValue, setTextValue] = useState("dog")
  const { handleUpdateStrokes, panResponder, strokes, handleUpdateProps } = useDrawing(selectedColor, selectedWidth, textValue, tStep, sendDrawingAsPNG(socketRef))

  useEffect(() => {
    const surface = Skia.Surface.MakeOffscreen(width, height)
    const canvas = surface?.getCanvas()
    const backgroundPaint = Skia.Paint()
    backgroundPaint.setStyle(PaintStyle.Fill)
    backgroundPaint.setColor(Skia.Color(backgroundColor)) // or any color

    canvas?.drawRect({ x: 0, y: 0, width, height }, backgroundPaint)
  }, [])


  const connectWebSocket = () => {
    socketRef.current = new WebSocket(SOCKET_URL)

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected!")
    }

    socketRef.current.onmessage = (event) => {
      // Assume the server sends binary image data
      const rawData = event.data
      if (rawData instanceof ArrayBuffer) {
        // Convert ArrayBuffer to a typed array
        const bytes = new Uint8Array(rawData)

        // Convert the bytes to a binary string
        let binaryString = ""
        for (let i = 0; i < bytes.byteLength; i++) {
          binaryString += String.fromCharCode(bytes[i])
        }
        // Encode that binary string to base64
        const base64String = btoa(binaryString)

        // Make a data URI for an <Image> component
        setOutputImage(`data:image/png;base64,${base64String}`)
      }
    }

    socketRef.current.onerror = (error) => {
      console.error("❌ WebSocket Error:", error)
    }

    socketRef.current.onclose = () => {
      console.log("⚠️ WebSocket Disconnected!")
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket...")
        socketRef.current.close()
        console.log("WebSocket closed")
      }
    }
  }, [])

  const handleCirclePress = (color) => {
    setSelectedColor(color)
    handleUpdateProps("color", color)
  }

  const handleSizeChange = (newSize) => {
    setSelectedWidth(newSize)
    handleUpdateProps("width", newSize)
  }

  return (
    <View>
        <Toolbar
          updateSelectedColor={(color) => handleCirclePress(color)}
          handleUpdateProps={handleUpdateProps}
          />
        <View style={{ justifyContent: "center", alignItems: "center" }} >
        <View>
            <View style={styles.container}>
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
        <Button title="clear" onPress={() => handleUpdateStrokes([])} />
        {/* 🔄 Display the image received from the WebSocket */}
        {outputImage && (
            <Image
            source={{ uri: outputImage }}
            style={{ width: 512, height: 512, marginTop: 20 }}
            />
        )}
        </View>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
})

export default PaintingPage
