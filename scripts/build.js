const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const rimraf = require('rimraf')
const ncp = require('ncp').ncp
const bplist = require('bplist')

const log = (label, done = false) => {
  console.log(`----- ${label}${done ? ` done\n` : ''}`)
}

const runCommand = (label, cmd, args, options) => {
  return new Promise((resolve, reject) => {
    log(label)

    const proc = spawn(cmd, args, { encoding: 'utf8', ...options || {} })

    let output = ''

    proc.stdout.on('data', data => {
      const dataStr = data.toString('utf8')
      output = output + dataStr
      console.log(dataStr.split('\n').map(line => `> ${line}`).join('\n'))
    })

    proc.stderr.on('data', data => {
      console.log(data.toString('utf8').split('\n').map(line => `> ${line}`).join('\n'))
    })

    proc.on('close', code => {
      if (code !== 0) {
        reject(`Bad return code: ${code}`)
      } else {
        log(label, true)
        resolve(output)
      }
    })

    proc.on('error', reject)
  })
}

const build = async (sdk, config) => {
  const output = await runCommand(
    `Framework build for ${sdk} ${config}`,
    'xcodebuild',
    [
      '-workspace',
      path.resolve(process.cwd(), 'ios', 'ReactNativeLib.xcworkspace'),
      '-scheme',
      'ReactNativeLib',
      '-configuration',
      config,
      '-sdk',
      sdk,
      'build',
    ],
  )

  const buildDir = output.match(/export TARGET_BUILD_DIR=(.*?)\n/)[1]
  return buildDir
}

const frameworkName = 'ReactNativeLib.framework'
const distDir = path.resolve(process.cwd(), 'dist')
const debugDir = path.resolve(distDir, 'Debug')
const releaseDir = path.resolve(distDir, 'Release')
const distrDir = path.resolve(distDir, 'Distr')
const debugFrameworkDir = path.resolve(debugDir, frameworkName)
const releaseFrameworkDir = path.resolve(releaseDir, frameworkName)
const distrFrameworkDir = path.resolve(distrDir, frameworkName)

const copyFrameworks = (deviceDebugBuildDir, deviceReleaseBuildDir) => {
  return new Promise((resolve, reject) => {
    const label = 'Copy frameworks'
    log(label)

    try {
      rimraf.sync(distDir)
      fs.mkdirSync(distDir)
      fs.mkdirSync(debugDir)
      fs.mkdirSync(releaseDir)
      fs.mkdirSync(distrDir)
      fs.mkdirSync(debugFrameworkDir)
      fs.mkdirSync(releaseFrameworkDir)
      fs.mkdirSync(distrFrameworkDir)

      ncp(path.resolve(deviceDebugBuildDir, frameworkName), debugFrameworkDir, err => {
        if (err) {
          reject(err)
          return
        }

        ncp(path.resolve(deviceReleaseBuildDir, frameworkName), releaseFrameworkDir, err => {
          if (err) {
            reject(err)
            return
          }

          ncp(path.resolve(deviceReleaseBuildDir, frameworkName), distrFrameworkDir, err => {
            if (err) {
              reject(err)
              return
            }

            log(label, true)
            resolve()
          })
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

const makeFatFramework = (simulatorBuildDir, deviceBuildDir, outputDir) => {
  const binaryName = 'ReactNativeLib'

  return runCommand(
    'Make fat framework',
    'lipo',
    [
      '-create',
      path.resolve(deviceBuildDir, frameworkName, binaryName),
      path.resolve(simulatorBuildDir, frameworkName, binaryName),
      '-output',
      path.resolve(outputDir, binaryName),
    ],
  )
}

const patchPlist = dir => {
  return new Promise((resolve, reject) => {
    const label = 'Patch framework plist'
    log(label)

    try {
      const plistPath = path.resolve(dir, 'Info.plist')
      const data = fs.readFileSync(plistPath)
      bplist.parseBuffer(data, (err, obj) => {
        if (err) {
          reject(err)
          return
        }

        try {
          obj[0]['CFBundleSupportedPlatforms'].push('iPhoneSimulator')

          fs.writeFileSync(plistPath, bplist.create(obj[0]))

          log(label, true)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

const zip = async (dir, name) => {
  const zipFile = path.resolve(distDir, name)

  await runCommand(`Archieve ${name}`, 'zip', ['-r', zipFile, frameworkName], { cwd: dir })
}

const buildIOSDist = async () => {
  try {
    if (process.platform !== 'darwin') {
      throw 'You need MacOS to build this'
    }

    const simulatorDebugBuildDir = await build('iphonesimulator', 'Debug')
    const simulatorReleaseBuildDir = await build('iphonesimulator', 'Release')
    const deviceDebugBuildDir = await build('iphoneos', 'Debug')
    const deviceReleaseBuildDir = await build('iphoneos', 'Release')
    await copyFrameworks(deviceDebugBuildDir, deviceReleaseBuildDir)
    await makeFatFramework(simulatorDebugBuildDir, deviceDebugBuildDir, debugFrameworkDir)
    await makeFatFramework(simulatorReleaseBuildDir, deviceReleaseBuildDir, releaseFrameworkDir)
    await patchPlist(debugFrameworkDir)
    await patchPlist(releaseFrameworkDir)
    await zip(debugDir, 'ReactNativeLib-Debug.framework.zip')
    await zip(releaseDir, 'ReactNativeLib-Release.framework.zip')
    await zip(distrDir, 'ReactNativeLib-Distr.framework.zip')
  } catch (err) {
    console.log(`Error: ${err}`)
  }
}

buildIOSDist()
