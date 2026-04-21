import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { styles } from '../styles';

export default function TopToast({ message, type = 'success', visible }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [visible]);

  if (!visible || !message) return null;

  return (
    <Animated.View
      style={[
        styles.topToast,
        type === 'error' ? styles.topToastError : styles.topToastSuccess,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0]
              })
            }
          ]
        }
      ]}
    >
      <Text style={styles.topToastText}>{message}</Text>
    </Animated.View>
  );
}
