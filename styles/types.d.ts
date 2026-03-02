// Handle CSS side-effect imports (like globals.css)
declare module './globals.css'

// Handle CSS module imports
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// Handle all other CSS imports
declare module '*.css'