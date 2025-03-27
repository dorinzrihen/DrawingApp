import { Children, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"

const ScrollViewWithClickOutside = ({isVisible, Children}) => {
    const clickOutsideRef = useClickOutside<View>(() => console.log("clicked outside A"))
    const [dropdownVisible, setDropdownVisible] = useState(false)

    return <View>
              {isVisible && (
            <View style={styles.dropdown}>
              <ScrollView contentContainerStyle={{ padding: 8 }} ref={clickOutsideRef}>
                {Children}
              </ScrollView>
            </View>
          )}
    </View>

}

const styles = StyleSheet.create({
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
})
