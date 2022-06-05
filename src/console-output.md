# Console Output

Because Anki is a GUI app, text output to stdout (eg `print("foo")`) is not
usually visible to the user. You can optionally reveal text printed to stdout,
and it is recommended that you do so while developing your add-on.

## Warnings

Anki uses stdout to print warnings about API deprecations, eg:

```
addons21/mytest/__init__.py:10:getNote is deprecated: please use 'get_note'
```

If these warnings are occurring in a loop, please address them promptly, as they can
slow Anki down even if the console is not shown.

## Printing text

You may find it useful to print text to stdout to aid in debugging your add-on.
Please avoid printing large amounts of text (eg in a loop that deals with hundreds or
thousands of items), as that may slow Anki down, even if the console is not shown.

## Showing the Console

### Windows

If you start Anki via the `anki-console.bat` file in `c:\program files\anki`, a
separate console window will appear.

### macOS

Open Terminal.app, then enter the following text and hit enter:

```
/Applications/Anki.app/Contents/MacOS/AnkiMac
```

### Linux

Open a terminal/xterm, then run Anki with `anki`
