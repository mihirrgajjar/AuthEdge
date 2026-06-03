const path = require('path');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true
    }
  },
  dependencies: {
    'react-native-sqlcipher-storage': {
      platforms: {
        android: {
          sourceDir: path.join(__dirname, 'node_modules/react-native-sqlcipher-storage/src/android'),
          packageImportPath: 'import org.pgsqlite.SQLitePluginPackage;',
          packageInstance: 'new SQLitePluginPackage()',
        }
      }
    }
  }
}