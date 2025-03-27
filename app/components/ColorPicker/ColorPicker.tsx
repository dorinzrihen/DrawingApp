import React, { useState } from "react"
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native"
import { colorFamilies } from "./ColorPickerLib"
import {ScrollViewWithClickOutside} from "../ScrollViewWithClickOutside";

const ColorFamiliesPalette = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#C53030") // example default color

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev)
  }

  const selectColor = (color) => {
    setSelectedColor(color)
    setDropdownVisible(false)
  }

  return (
    <View style={styles.container}>
      {/* The main color circle */}
      <TouchableOpacity
        style={[styles.selectedColorCircle, { backgroundColor: selectedColor }]}
        onPress={toggleDropdown}
      />

      {/* Dropdown that shows multiple color families */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <ScrollViewWithClickOutside isVisible={dropdownVisible} handleClickOutside={() => setDropdownVisible(false)}>
            {colorFamilies.map((family) => (
              <View key={family.name} style={styles.familyContainer}>
                <Text style={styles.familyName}>{family.name}</Text>
                <View style={styles.colorsRow}>
                  {family.colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorCircle, { backgroundColor: color }]}
                      onPress={() => selectColor(color)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollViewWithClickOutside>

        </View>
      )}
    </View>
  )
}

export default ColorFamiliesPalette

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "flex-start",
  },
  selectedColorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  dropdown: {
    position: "absolute",
    top: 50,
    width: 220,
    maxHeight: 280, // limit dropdown height if desired
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    zIndex: 999,
  },
  familyContainer: {
    marginBottom: 12,
  },
  familyName: {
    marginBottom: 4,
    fontWeight: "600",
  },
  colorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
})
