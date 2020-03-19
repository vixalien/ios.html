# iOS-UI

iOS UI is a project, to transcribe [iOS Human Design Interface](https://developer.apple.com/design/human-design-interface/ios) into pure HTML

## Building

### 1. [Stylus](stylus-lang.com)

Stylus is an easy generator that transcribes into CSS, we use it to facilitate CSS
```bash
stylus stylus/ -o css/ -w -l -r --resolve-url-nocheck -U
```
Explanation of Options
----------------------
- -w watch: compile as any change is made
- -l line-number: Emits comments in the generated CSS indicating the corresponding Stylus line
- -r Resolve relative urls inside imports
- --resolve-url-nocheck Like -r but without file existence check
- -U inline-image: Utilize image inlining via data URI support

## Serving

Go to `docs/index.html` to view the docs

## Conributing

Any Contribution is important, especially those that add new elements specified in [iOS Human Design Interface](https://developer.apple.com/design/human-design-interface/ios) or those that improve the existing status

To contribute is very easy

### 1. Clone

First ensure you have git

Clone this repository onto your local filesystem

```bash
git clone https://github.com/vixalien/ios.html.git
```

### 2. Make your changes

### 3. Push it back to the server

```bash
git push master origin -U
```

# Thanks!!!