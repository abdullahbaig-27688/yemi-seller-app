import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label?: string;
  onImagesChange?: (images: string[]) => void;
};
const imagePickerBox = ({ label, onImagesChange }: Props) => {
  const [images, setImages] = React.useState<string[]>([]);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      const newImages = [...images, ...uris];
      setImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const removeImage = (uri: string) => {
    const filtered = images.filter((img) => img !== uri);
    setImages(filtered);
    onImagesChange?.(filtered);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <Pressable
              style={styles.removeBtn}
              onPress={() => removeImage(uri)}
            >
              <Ionicons name="close-circle" size={22} color="red" />
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.uploadBox} onPress={pickImage}>
          <Ionicons name="add" size={32} color="#999" />
          <Text style={styles.uploadText}>Upload</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default imagePickerBox;

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  uploadBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  uploadText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
});
