import * as Haptics from "expo-haptics";

export function useHaptics() {
  return {
    tap:     () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    success: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    error:   () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    levelUp: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    heavy:   () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  };
}
