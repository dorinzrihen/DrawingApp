import { useState } from "react";
import { TextInput, View, StyleSheet, Text } from "react-native";

const CategoryInput = ({ handleUpdateProps }) => {
  const [input, setInput] = useState("dog");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Category:</Text>
      <TextInput
        style={styles.input}
        placeholder="Write here..."
        value={input}
        onChangeText={(newText) => {
          handleUpdateProps("value", newText);
          setInput(newText);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",    // Put items in a row
    alignItems: "center",    // Vertically align them
  },
  label: {
    marginRight: 8,        
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    borderRadius: 6,
  },
});

export default CategoryInput;
