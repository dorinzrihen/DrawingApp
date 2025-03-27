import React from "react"
import {
  View,
  StyleSheet,
} from "react-native"
import ColorPicker from "../ColorPicker/ColorPicker"
import CategoryInput from "../CategoryInput/CategoryInput"
import StrokePicker from "../StrokePicker/StrokePicker"

const Toolbar = ({updateSelectedColor, handleUpdateProps}) => {
  return (
    <View style={styles.container}>
      <CategoryInput handleUpdateProps={handleUpdateProps}/>
      <ColorPicker updateSelectedColor={updateSelectedColor}/>
      <StrokePicker handleUpdateProps={handleUpdateProps}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 30,
    padding: 10,
  },
})

export default Toolbar
