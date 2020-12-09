# Qt

As mentioned in the overview, the Qt documentation is invaluable for
learning how to display different GUI widgets.

One particular thing to bear in mind is that objects are garbage
collected in Python, so if you do something like:

```python
def myfunc():
    widget = QWidget()
    widget.show()
```

…​then the widget will disappear as soon as the function exits. To
prevent this, assign top level widgets to an existing object, like:

```python
def myfunc():
    mw.myWidget = widget = QWidget()
    widget.show()
```

This is often not required when you create a Qt object and give it an
existing object as the parent, as the parent will keep a reference to
the object.

# Standard Modules

Anki ships with only the standard modules necessary to run the program -
a full copy of Python is not included. For that reason, if you need to
use a standard module that is not included with Anki, you’ll need to
bundle it with your add-on.

This only works with pure Python modules - modules that require C
extensions such as numpy are much more difficult to package, as you
would need to compile them for each of the operating systems Anki
supports. If you’re doing something sophisticated, it would be easier to
get your users to install a standalone copy of Python instead.

# Configuration

If you include a config.json file with a JSON dictionary in it, Anki
will allow users to edit it from the add-on manager.

A simple example: in config.json:

    {"myvar": 5}

In config.md:

    This is documentation for this add-on's configuration, in *markdown* format.

In your add-on’s code:

```python
from aqt import mw
config = mw.addonManager.getConfig(__name__)
print("var is", config['myvar'])
```

When updating your add-on, you can make changes to config.json. Any
newly added keys will be merged with the existing configuration.

If you change the value of existing keys in config.json, users who have
customized their configuration will continue to see the old values
unless they use the "restore defaults" button.

If you need to programmatically modify the config, you can save your
changes with:

```python
mw.addonManager.writeConfig(__name__, config)
```

If no config.json file exists, getConfig() will return None - even if
you have called writeConfig().

Add-ons that manage options in their own GUI can have that GUI displayed
when the config button is clicked:

```python
mw.addonManager.setConfigAction(__name__, myOptionsFunc)
```

Avoid key names starting with an underscore - they are reserved for
future use by Anki.

# User Files

When your add-on needs configuration data other than simple keys and
values, it can use a special folder called user_files in the root of
your add-on’s folder. Any files placed in this folder will be preserved
when the add-on is upgraded. All other files in the add-on folder are
removed on upgrade.

To ensure the user_files folder is created for the user, you can put a
README.txt or similar file inside it before zipping up your add-on.

When Anki upgrades an add-on, it will ignore any files in the .zip that
already exist in the user_files folder.

# Javascript

Anki provides a hook to modify the question and answer HTML before it is
displayed in the review screen, preview dialog, and card layout screen.
This can be useful for adding Javascript to the card.

An example:

```python
from anki.hooks import addHook
def prepare(html, card, context):
    return html + """
<script>
document.body.style.background = "blue";
</script>"""
addHook('prepareQA', prepare)
```

The hook takes three arguments: the HTML of the question or answer, the
current card object (so you can limit your add-on to specific note types
for example), and a string representing the context the hook is running
in.

Make sure you return the modified HTML.

Context is one of: "reviewQuestion", "reviewAnswer", "clayoutQuestion",
"clayoutAnswer", "previewQuestion" or "previewAnswer".

The answer preview in the card layout screen, and the previewer set to
"show both sides" will only use the "Answer" context. This means
Javascript you append on the back side of the card should not depend on
Javascript that is only added on the front.

Because Anki fades the previous text out before revealing the new text,
Javascript hooks are required to perform actions like scrolling at the
correct time. You can use them like so:

```python
from anki.hooks import addHook
def prepare(html, card, context):
    return html + """
<script>
onUpdateHook.push(function () {
    window.scrollTo(0, 2000);
})
</script>"""
addHook('prepareQA', prepare)
```

- onUpdateHook fires after the new card has been placed in the DOM,
  but before it is shown.

- onShownHook fires after the card has faded in.

The hooks are reset each time the question or answer is shown.

# Debugging

If your code throws an exception, it will be caught by Anki’s standard
exception handler (which catches anything written to stderr). If you
need to print information for debugging purposes, you can use
aqt.utils.showInfo, or write it to stderr with
sys.stderr.write("text\\n").

Anki also includes a REPL. From within the program, press the [shortcut
key](https://apps.ankiweb.net/docs/manual.html#debug-console) and a
window will open up. You can enter expressions or statements into the
top area, and then press ctrl+return/command+return to evaluate them. An
example session follows:

    >>> mw
    <no output>

    >>> print(mw)
    <aqt.main.AnkiQt object at 0x10c0ddc20>

    >>> invalidName
    Traceback (most recent call last):
      File "/Users/dae/Lib/anki/qt/aqt/main.py", line 933, in onDebugRet
        exec text
      File "<string>", line 1, in <module>
    NameError: name 'invalidName' is not defined

    >>> a = [a for a in dir(mw.form) if a.startswith("action")]
    ... print(a)
    ... print()
    ... pp(a)
    ['actionAbout', 'actionCheckMediaDatabase', ...]

    ['actionAbout',
     'actionCheckMediaDatabase',
     'actionDocumentation',
     'actionDonate',
     ...]

    >>> pp(mw.reviewer.card)
    <anki.cards.Card object at 0x112181150>

    >>> pp(card()) # shortcut for mw.reviewer.card.__dict__
    {'_note': <anki.notes.Note object at 0x11221da90>,
     '_qa': [...]
     'col': <anki.collection._Collection object at 0x1122415d0>,
     'data': u'',
     'did': 1,
     'due': -1,
     'factor': 2350,
     'flags': 0,
     'id': 1307820012852L,
     [...]
    }

    >>> pp(bcard()) # shortcut for selected card in browser
    <as above>

Note that you need to explicitly print an expression in order to see
what it evaluates to. Anki exports pp() (pretty print) in the scope to
make it easier to quickly dump the details of objects, and the shortcut
ctrl+shift+return will wrap the current text in the upper area with pp()
and execute the result.

If you’re on Linux or are running Anki from source, it’s also possible
to debug your script with pdb. Place the following line somewhere in
your code, and when Anki reaches that point it will kick into the
debugger in the terminal:

```python
    from aqt.qt import debug; debug()
```

Alternatively you can export DEBUG=1 in your shell and it will kick into
the debugger on an uncaught exception.

# Learning More

Anki’s source code is available at <http://github.com/ankitects/anki/>. The
colllection object is defined in anki’s collection.py. Other useful
files to check out are cards.py, notes.py, sched.py, models.py and
decks.py.

It can also be helpful to look in the aqt source to see how it’s calling
anki for a particular operation, or to learn more about the GUI.

Much of the GUI is defined in designer files. You can use the Qt
Designer program to open the .ui files and browse the GUI in a
convenient way.

And finally, it can also be extremely helpful to browse other add-ons to
see how they accomplish something.
