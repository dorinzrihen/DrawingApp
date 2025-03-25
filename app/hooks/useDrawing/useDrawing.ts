import { useRef, useState } from "react"
import { Stroke } from "./useDrawing.types"
import { PanResponder } from "react-native"
import { Skia } from "@shopify/react-native-skia"

const useDrawing = (defaultColor: string, defaultWidth: number, defualtText: string, defualtTStep: number, onFinishStroke: (stroke, props) => void) => {
    const [strokes, setStrokes] = useState<Stroke[]>([])
    const currentStroke = useRef<Stroke | null>(null)
    const strokesRef = useRef<Stroke[]>([])

    const props = useRef({
        color: defaultColor,
        width: defaultWidth,
        strokes: strokes,
        text: defualtText,
        tStep: defualtTStep,
    })

    const handleUpdateStrokes = (updatedStrokes: Stroke[]) => {
        setStrokes(() => {
            strokesRef.current = updatedStrokes
            return updatedStrokes
        })
    }

    const handleUpdateProps = (key: string, value: number | string) => {
        props.current = { ...props.current, [key]: value }
    }

    const panResponderRelease = (currentStrokes, currentProps) => {
        console.log("here",currentStrokes)
        onFinishStroke(currentStrokes, currentProps)
    }

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                console.log("Finger down on canvas!")
                const { locationX, locationY } = evt.nativeEvent
                const newPath = Skia.Path.Make()
                newPath.moveTo(locationX, locationY)

                // Create a stroke with the *current* selected color & width.
                const newStroke: Stroke = {
                    path: newPath,
                    color: props.current.color,    // uses the color in state at this moment
                    strokeWidth: props.current.width,
                }

                currentStroke.current = newStroke
                setStrokes((prev) => {
                    strokesRef.current = [...prev, newStroke]
                    return [...prev, newStroke]
                })
            },
            onPanResponderMove: (evt) => {
                if (currentStroke.current) {
                    if (currentStroke.current) {
                        currentStroke.current.color = props.current.color
                        currentStroke.current.strokeWidth = props.current.width
                        const { locationX, locationY } = evt.nativeEvent
                        currentStroke.current.path.lineTo(locationX, locationY)
                        setStrokes((prev) => {
                            strokesRef.current = [...prev]
                            return [...prev]
                        })
                    }
                }
            },
            onPanResponderRelease: () => {
                currentStroke.current = null
                panResponderRelease(strokesRef.current, props.current)
            },
        }))

    return { handleUpdateStrokes, panResponder, strokes, handleUpdateProps }
}

export default useDrawing
