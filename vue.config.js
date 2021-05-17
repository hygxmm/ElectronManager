module.exports = {
    productionSourceMap: false, // 生产打包时不输出map文件，增加打包速度
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
            config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
            config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
            config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
        }
    },// 生产环境配置,压缩代码等等
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: "com.electron.manager",
                productName: "Manager",
                copyright: "Copyright @2021.01.05 liuhuan",
                mac: {
                    category: "public.app-category.developer-tools",
                    icon: "build/icon.icns",
                }
            }
        }
    }
}