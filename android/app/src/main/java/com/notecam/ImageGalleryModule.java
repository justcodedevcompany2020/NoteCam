package com.notecam;

import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.HashMap;
import java.util.Map;

public class ImageGalleryModule extends ReactContextBaseJavaModule {
  public ImageGalleryModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ImageGalleryModule";
  }

  // TODO: Implement the methods here

  @ReactMethod
  public void openImageInGallery(String imagePath, Callback callback) {
    try {
      Uri imageUri = Uri.parse(imagePath);
      Intent intent = new Intent(Intent.ACTION_VIEW);
      intent.setDataAndType(imageUri, "image/*");
      intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getReactApplicationContext().startActivity(intent);
      callback.invoke(true); // Callback success
    } catch (Exception e) {
      callback.invoke(false); // Callback error
    }
  }


  @ReactMethod
  public void exampleMethod(String message, Callback callback) {
    callback.invoke("Received message: " + message);
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("EXAMPLE_CONSTANT", "example");
    return constants;
  }

}
