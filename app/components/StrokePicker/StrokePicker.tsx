import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollViewWithClickOutside } from "../ScrollViewWithClickOutside";

const widthOptions = [5,10,15,20] as const

const StrokePicker = ({handleUpdateProps}) => {
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [selectedWidth, setSelectedWidth] = useState<number>(widthOptions[0])
    console.log("here")
    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev)
    }
    
    const selectWidth = (widthSize: number) => {
        setSelectedWidth(widthSize)
        handleUpdateProps('width', selectWidth)
        setDropdownVisible(false)
    }

    console.log(selectedWidth)
    return <View>
        <TouchableOpacity
            style={[styles.circleContainer, { width: 50, height: 50}]}
            onPress={toggleDropdown}
        >
            <View style={[styles.selectedColorCircle, { width: selectedWidth, height: selectedWidth}]}/>
        </TouchableOpacity>
        <View>
            <ScrollViewWithClickOutside isVisible={dropdownVisible} handleClickOutside={() => setDropdownVisible(false)}>
                {widthOptions.map(option =>                     
                    <TouchableOpacity
                        key={option}
                        style={[{ width: 50, height: 50}]}
                        onPress={() => selectWidth(option)}
                    >
                        <View
                            style={[styles.selectedColorCircle,{ width: Number(option), height: Number(option)}]}

                        />
                    </TouchableOpacity> 
                )}
            </ScrollViewWithClickOutside>
        </View>
    </View>
}


const styles = StyleSheet.create({
  circleContainer: {
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center"
  }, 
  selectedColorCircle: {
    backgroundColor: "black",
    borderRadius: "50%",
    margin: 20
  },
})


export default StrokePicker;