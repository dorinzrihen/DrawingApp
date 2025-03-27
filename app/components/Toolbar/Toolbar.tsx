import React from "react"
import {
  View,
  StyleSheet,
} from "react-native"
import ColorPicker from "../ColorPicker/ColorPicker"
import CategoryInput from "../CategoryInput/CategoryInput"

const Toolbar = ({updateSelectedColor, handleUpdateProps}) => {
  return (
    <View style={styles.container}>
      <CategoryInput handleUpdateProps={handleUpdateProps}/>
      <ColorPicker updateSelectedColor={updateSelectedColor}/>
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
