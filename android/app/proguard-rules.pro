# React Native ProGuard rules (R8 safe)
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# React Native Bridge
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

# React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# TurboModules (New Architecture)
-keep class com.facebook.react.turbomodule.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Screens
-keep class com.swmansion.rnscreens.** { *; }

# Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# SVG
-keep class com.horcrux.svg.** { *; }

# Expo
-keep class expo.modules.** { *; }

# Gorhom Bottom Sheet
-keep class com.gorhom.** { *; }

# Linear Gradient
-keep class com.BV.LinearGradient.** { *; }

# Keep all React Native views
-keep class * extends com.facebook.react.views.view.ReactViewManager { *; }
