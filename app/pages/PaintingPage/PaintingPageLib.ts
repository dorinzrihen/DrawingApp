import { ImageFormat, PaintStyle, Skia } from "@shopify/react-native-skia"
import { Stroke } from "../../hooks/useDrawing/useDrawing.types"

export const width = 512
export const height = 512
export const backgroundColor = "black"

export const sendDrawingAsPNG = (socketRef: WebSocket) => (strokes: Stroke[], props) => {
    console.log(socketRef)
  if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not open")
    return
  }
  const surface = Skia.Surface.MakeOffscreen(width, height)
  const canvas = surface?.getCanvas()

  // Draw all paths to the offscreen canvas
  try {
    const bgPaint = Skia.Paint()
    bgPaint.setStyle(PaintStyle.Fill)
    bgPaint.setColor(Skia.Color("black"))
    canvas?.drawRect({ x: 0, y: 0, width, height }, bgPaint)
    const realPaths = Array.from(strokes)
    realPaths.forEach((stroke, i) => {
      console.log(i, stroke.color, stroke.strokeWidth)
      const paint = Skia.Paint()
      paint.setStyle(PaintStyle.Stroke)
      paint.setStrokeWidth(stroke.strokeWidth)
      paint.setAntiAlias(true)
      paint.setColor(Skia.Color(stroke.color))
      canvas?.drawPath(stroke.path, paint)
    })
  }
  catch (e) { console.log(e) }


  const image = surface?.makeImageSnapshot()
  const pngBytes = image?.encodeToBytes(ImageFormat.PNG)
  // const path = `${RNFS.DownloadDirectoryPath}/my-image${Math.random()}.png`;
  // const base64Image = arrayBufferToBase64(pngBytes.buffer);
  // try {
  //   await RNFS.writeFile(path, base64Image, 'base64');
  // } catch (err) {
  //   console.error('Error saving image:', err);
  // }
  if (pngBytes) {
    socketRef.current.send(pngBytes.buffer)
    socketRef.current.send(JSON.stringify({
      "prompt": props.text,
      "server_noise": true,
      "image_format": "png",
      "t_steps": [props.tStep],
    }))
    console.log("🖼️ PNG sent to server")
  } else {
    console.warn("⚠️ Failed to encode image")
  }
}
