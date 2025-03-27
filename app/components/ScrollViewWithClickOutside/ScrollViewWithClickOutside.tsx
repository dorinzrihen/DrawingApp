import { ScrollView, StyleSheet, View } from "react-native"
import { useClickOutside } from "react-native-click-outside";
import { ScrollViewWithClickOutsideProps } from "./ScrollViewWithClickOutside.types";


const ScrollViewWithClickOutside = ({isVisible, handleClickOutside, children}: ScrollViewWithClickOutsideProps) => {
    const clickOutsideRef = useClickOutside<ScrollView>(() => handleClickOutside())

    return <View>
      {isVisible && (
        <View style={styles.dropdown}>
          <ScrollView contentContainerStyle={{ padding: 8 }} ref={clickOutsideRef}>
            {children}
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

export default ScrollViewWithClickOutside;