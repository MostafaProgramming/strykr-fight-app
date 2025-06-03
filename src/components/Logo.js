import React from "react";
import { View, Image } from "react-native";
import { colors } from "../constants/colors";

const Logo = ({
  size = "medium",
  showBackground = true,
  customSize = null,
  backgroundColor = colors.primary,
}) => {
  const getSizeConfig = () => {
    if (customSize) {
      return {
        container: customSize,
        imageSize: customSize * 0.8,
        borderRadius: customSize / 2,
      };
    }

    switch (size) {
      case "small":
        return {
          container: 32,
          imageSize: 24,
          borderRadius: 16,
        };
      case "medium":
        return {
          container: 50,
          imageSize: 40,
          borderRadius: 25,
        };
      case "large":
        return {
          container: 80,
          imageSize: 64,
          borderRadius: 40,
        };
      case "xlarge":
        return {
          container: 120,
          imageSize: 116,
          borderRadius: 60,
        };
      default:
        return {
          container: 50,
          imageSize: 40,
          borderRadius: 25,
        };
    }
  };

  const config = getSizeConfig();

  if (!showBackground) {
    return (
      <Image
        source={require("../../assets/fighttracker-logo.png")}
        style={{
          width: config.imageSize,
          height: config.imageSize,
        }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      style={{
        width: config.container,
        height: config.container,
        backgroundColor: backgroundColor,
        borderRadius: config.borderRadius,
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      <Image
        source={require("../../assets/fighttracker-logo.png")}
        style={{
          width: config.imageSize,
          height: config.imageSize,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default Logo;
