const fs = require('fs');
const path = require('path');

console.log('Applying react-native-sqlcipher-storage patches...');

// 1. Patch sqlite.core.js
const coreJsPath = path.join(__dirname, 'node_modules/react-native-sqlcipher-storage/lib/sqlite.core.js');
if (fs.existsSync(coreJsPath)) {
  let content = fs.readFileSync(coreJsPath, 'utf8');
  // Remove React import
  content = content.replace("import React from 'react';", "");
  // Replace window.setImmediate / window.setTimeout
  content = content.replace(
    "nextTick = window.setImmediate || function(fun) {\n  window.setTimeout(fun, 0);\n};",
    "nextTick = (typeof global !== 'undefined' && global.setImmediate) || (typeof setImmediate !== 'undefined' && setImmediate) || function(fun) {\n  setTimeout(fun, 0);\n};"
  );
  fs.writeFileSync(coreJsPath, content, 'utf8');
  console.log('✔ Patched sqlite.core.js');
} else {
  console.log('✘ Could not find sqlite.core.js');
}

// 2. Patch SQLitePluginPackage.java
const packageJavaPath = path.join(__dirname, 'node_modules/react-native-sqlcipher-storage/src/android/src/main/java/org/pgsqlite/SQLitePluginPackage.java');
if (fs.existsSync(packageJavaPath)) {
  let content = fs.readFileSync(packageJavaPath, 'utf8');
  const deprecatedMethod = `    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }`;
  content = content.replace(deprecatedMethod, "");
  fs.writeFileSync(packageJavaPath, content, 'utf8');
  console.log('✔ Patched SQLitePluginPackage.java');
} else {
  console.log('✘ Could not find SQLitePluginPackage.java');
}

// 3. Patch library build.gradle
const gradlePath = path.join(__dirname, 'node_modules/react-native-sqlcipher-storage/src/android/build.gradle');
if (fs.existsSync(gradlePath)) {
  const newGradleContent = `def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

apply plugin: 'com.android.library'

android {
    namespace "org.pgsqlite"
    compileSdkVersion safeExtGet('compileSdkVersion', 34)
    buildToolsVersion safeExtGet('buildToolsVersion', "34.0.0")

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
    }
    lintOptions {
        abortOnError false
    }
}

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
    implementation 'net.zetetic:android-database-sqlcipher:3.5.9@aar'
}
`;
  fs.writeFileSync(gradlePath, newGradleContent, 'utf8');
  console.log('✔ Patched build.gradle');
} else {
  console.log('✘ Could not find build.gradle');
}

// 4. Delete settings.gradle in dependency
const settingsPath = path.join(__dirname, 'node_modules/react-native-sqlcipher-storage/src/android/settings.gradle');
if (fs.existsSync(settingsPath)) {
  fs.unlinkSync(settingsPath);
  console.log('✔ Deleted nested settings.gradle');
} else {
  console.log('✔ Nested settings.gradle already removed/not found');
}

console.log('All patches applied successfully!');
