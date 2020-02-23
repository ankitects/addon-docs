Hooks & Filters
===============

Hooks are the way you should connect your add-on code to Anki. If the
function you want to alter doesn’t already have a hook, please see the
section below about adding new hooks.

There are two different kinds of "hooks":

-   Regular hooks are functions that don’t return anything. They are run
    for their side effects, and may sometimes alter the objects they
    have been passed, such as inserting an extra item in a list.

-   "Filters" are functions that return their first argument, after
    maybe changing it. An example filter is one that takes the text of a
    field during card display, and returns an altered version.

The distinction is necessary because some data types in Python can be
modified directly, and others can only be modified by creating a changed
copy (such as strings).

New Style Hooks
===============

This section covers things that are in Anki 2.1.20. If you are using an
earlier Anki version, please skip this section.

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

An easy way to see all hooks at a glance is to look at
pylib/tools/genhooks.py and qt/tools/genhooks\_gui.py.

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
below), so old add-ons will continue to work for now, but add-on authors
are encouraged to update to the new style as it allows for code
completion, and better error checking.

Legacy Hook Handling
====================

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
    card.odid = 0
    if card.odue:
        card.due = card.odue
        card.odue = 0

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

Adding Hooks
============

If you want to modify a function that doesn’t already have a hook,
please submit a pull request that adds the hooks you need. To do this,
you’ll need to download Anki’s full source code - the type hints covered
in the IDE section are not enough.

The hook definitions are located in pylib/tools/genhooks.py and
qt/tools/genhooks.py. When 'make develop' is run, the build scripts will
automatically update the hook files with the definitions listed there.

Please see README.contributing in the source code for more information.
