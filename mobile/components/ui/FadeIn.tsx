import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  translateX?: number;
  style?: ViewStyle;
}

export function FadeIn({ children, delay = 0, duration = 350, translateY = 0, translateX = 0, style }: Props) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const slideY   = useRef(new Animated.Value(translateY)).current;
  const slideX   = useRef(new Animated.Value(translateX)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(slideY,  { toValue: 0, duration, delay, useNativeDriver: true }),
      Animated.timing(slideX,  { toValue: 0, duration, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: slideY }, { translateX: slideX }] }, style]}>
      {children}
    </Animated.View>
  );
}
