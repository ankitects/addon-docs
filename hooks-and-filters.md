# Hooks & Filters

Hooks are the way you should connect your add-on code to Anki. If the
function you want to alter doesn’t already have a hook, please see the
section below about adding new hooks.

There are two different kinds of "hooks":

- Regular hooks are functions that don’t return anything. They are run
  for their side effects, and may sometimes alter the objects they
  have been passed, such as inserting an extra item in a list.

- "Filters" are functions that return their first argument, after
  maybe changing it. An example filter is one that takes the text of a
  field during card display, and returns an altered version.

The distinction is necessary because some data types in Python can be
modified directly, and others can only be modified by creating a changed
copy (such as strings).

## New Style Hooks

A new style of hook was added in Anki 2.1.20.

Imagine you wish to show a message each time the front side of a card is
shown in the review screen. You’ve looked at the source code in
reviewer.py, and seen the following line in the showQuestion() function:

```python
gui_hooks.reviewer_did_show_question(card)
```

To register a function to be called when this hook is run, you can do
the following in your add-on:

```python
from aqt import gui_hooks

def myfunc(card):
  print("question shown, card question is:", card.q())

gui_hooks.reviewer_did_show_question.append(myfunc)
```

Multiple add-ons can register for the same hook or filter - they will
all be called in turn.

To remove a hook, use code like:

```
gui_hooks.reviewer_did_show_question.remove(myfunc)
```

:warning: Functions you attach to a hook should not modify the hook while they are executing, as it will break things:

```
def myfunc(card):
  # DON'T DO THIS!
  gui_hooks.reviewer_did_show_question.remove(myfunc)

gui_hooks.reviewer_did_show_question.append(myfunc)
```

An easy way to see all hooks at a glance is to look at
pylib/tools/genhooks.py and qt/tools/genhooks_gui.py.

If you have set up type completion as described in an earlier section,
you can also see the hooks in your IDE:

<video controls autoplay loop muted>
 <source src="img/autocomplete.mp4" type="video/mp4">
</video>

In the above video, holding the command/ctrl key down while hovering
will show a tooltip, including arguments and documentation if it exists.
The argument names and types for the callback can be seen on the bottom
line.

For some examples of how the new hooks are used, please see
<https://github.com/ankitects/anki-addons/blob/master/demos/>.

Most of the new style hooks will also call the legacy hooks (described
further below), so old add-ons will continue to work for now, but add-on authors
are encouraged to update to the new style as it allows for code
completion, and better error checking.

## Notable Hooks

For a full list of hooks, and their documentation, please see

- [The GUI hooks](https://github.com/ankitects/anki/blob/master/qt/tools/genhooks_gui.py)
- [The pylib hooks](https://github.com/ankitects/anki/blob/master/pylib/tools/genhooks.py)

### Webview

Many of Anki's screens are built with one or more webviews, and there are
some hooks you can use to intercept their use.

From Anki 2.1.22:

- `gui_hooks.webview_will_set_content()` allows you to modify the HTML that
  various screens send to the webview. You can use this for adding your own
  HTML/CSS/Javascript to particular screens. This will not work for external
  pages - see the Anki 2.1.36 section below.
- `gui_hooks.webview_did_receive_js_message()` allows you to intercept
  messages sent from Javascript. Anki provides a `pycmd(string)` function in
  Javascript which sends a message back to Python, and various screens such as
  reviewer.py respond to the messages. By using this hook, you can respond
  to your own messages as well.

From Anki 2.1.36:

- `webview_did_inject_style_into_page()` gives you an opportunity to inject
  styling or content into external pages like the graphs screen and congratulations
  page that are loaded with load_ts_page().

## Legacy Hook Handling

Older versions of Anki used a different hook system, using the functions
runHook(), addHook() and runFilter().

For example, when the scheduler (anki/sched.py) discovers a leech, it
calls:

```python
runHook("leech", card)
```

If you wished to perform a special operation when a leech was
discovered, such as moving the card to a "Difficult" deck, you could do
it with the following code:

```python
from anki.hooks import addHook
from aqt import mw

def onLeech(card):
    # can modify without .flush(), as scheduler will do it for us
    card.did = mw.col.decks.id("Difficult")
    # if the card was in a cram deck, we have to put back the original due
    # time and original deck
    if card.odid:
        card.did = card.odid
        card.odue = 0
        card.odid = 0

addHook("leech", onLeech)
```

An example of a filter is in aqt/editor.py. The editor calls the
"editFocusLost" filter each time a field loses focus, so that add-ons
can apply changes to the note:

```python
if runFilter(
    "editFocusLost", False, self.note, self.currentField):
    # something updated the note; schedule reload
    def onUpdate():
        self.loadNote()
        self.checkValid()
    self.mw.progress.timer(100, onUpdate, False)
```

Each filter in this example accepts three arguments: a modified flag,
the note, and the current field. If a filter makes no changes it returns
the modified flag the same as it received it; if it makes a change it
returns True. In this way, if any single add-on makes a change, the UI
will reload the note to show updates.

The Japanese Support add-on uses this hook to automatically generate one
field from another. A slightly simplified version is presented below:

```python
def onFocusLost(flag, n, fidx):
    from aqt import mw
    # japanese model?
    if "japanese" not in n.model()['name'].lower():
        return flag
    # have src and dst fields?
    for c, name in enumerate(mw.col.models.fieldNames(n.model())):
        for f in srcFields:
            if name == f:
                src = f
                srcIdx = c
        for f in dstFields:
            if name == f:
                dst = f
    if not src or not dst:
        return flag
    # dst field already filled?
    if n[dst]:
        return flag
    # event coming from src field?
    if fidx != srcIdx:
        return flag
    # grab source text
    srcTxt = mw.col.media.strip(n[src])
    if not srcTxt:
        return flag
    # update field
    try:
        n[dst] = mecab.reading(srcTxt)
    except Exception, e:
        mecab = None
        raise
    return True

addHook('editFocusLost', onFocusLost)
```

The first argument of a filter is the argument that should be returned.
In the focus lost filter this is a flag, but in other cases it may be
some other object. For example, in anki/collection.py, \_renderQA()
calls the "mungeQA" filter which contains the generated HTML for the
front and back of cards. latex.py uses this filter to convert text in
LaTeX tags into images.

In Anki 2.1, a hook was added for adding buttons to the editor. It can
be used like so:

```python
from aqt.utils import showInfo
from anki.hooks import addHook

# cross out the currently selected text
def onStrike(editor):
    editor.web.eval("wrap('<del>', '</del>');")

def addMyButton(buttons, editor):
    editor._links['strike'] = onStrike
    return buttons + [editor._addButton(
        "iconname", # "/full/path/to/icon.png",
        "strike", # link name
        "tooltip")]

addHook("setupEditorButtons", addMyButton)
```

## Adding Hooks

If you want to modify a function that doesn’t already have a hook,
please submit a pull request that adds the hooks you need.

The hook definitions are located in `pylib/tools/genhooks.py` and
`qt/tools/genhooks_gui.py`. When building Anki, the build scripts will
automatically update the hook files with the definitions listed there.

Please see the docs/ folder in the source tree for more information.
