import { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

export function TimerRing({ durationSeconds, onExpire, size = 52 }: { durationSeconds: number; onExpire: () => void; size?: number }) {
  const R            = (size - 6) / 2;
  const circumference = 2 * Math.PI * R;
  const [remaining, setRemaining] = useState(durationSeconds);
  const progress     = useRef(new Animated.Value(circumference)).current;
  const expired      = useRef(false);

  useEffect(() => {
    expired.current = false;
    setRemaining(durationSeconds);

    Animated.timing(progress, {
      toValue: 0,
      duration: durationSeconds * 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !expired.current) { expired.current = true; onExpire(); }
    });

    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(interval); return 0; }
        return r - 1;
      });
    }, 1000);

    return () => { clearInterval(interval); progress.stopAnimation(); };
  }, [durationSeconds]);

  const strokeDashoffset = progress;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={R} stroke="rgba(26,45,66,0.7)" strokeWidth={4} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={R}
          stroke={remaining <= 10 ? "#FF2D55" : "#00F5FF"}
          strokeWidth={4} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset as any}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2},${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: 11, fontFamily: "SpaceMono_700Bold", color: remaining <= 10 ? "#FF2D55" : "#00F5FF" }}>
        {remaining}
      </Text>
    </View>
  );
}

import { Animated as RNAnimated } from "react-native";
const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);
