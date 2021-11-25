# Getting Started

<!-- toc -->

## Support

This document contains some hints to get you started, but it is not a
comprehensive guide. To actually write an add-on, you will need to
familiarize yourself with Anki’s source code, and the source code of
other add-ons that do similiar things to what you are trying to
accomplish.

Because of our limited resources, **no official support is available for
add-on writing**. If you have any questions, you will either need to
find the answers yourself in the source code, or post your questions on
the [development forum](https://forums.ankiweb.net/c/development/12).

You can also use the add-on forum to request someone write an add-on for
you. You may need to offer some money before anyone becomes interested
in helping you.

## IDE & Type Hints

The free community edition of PyCharm has good out of the box support
for Python: <https://www.jetbrains.com/pycharm/>. You can also use other
editors like Visual Studio Code, but the instructions in this section
will cover PyCharm.

Over the last year, Anki’s codebase has been updated to add type hints to almost
all of the code. These type hints make development easier, by providing better
code completion, and by catching errors using tools like mypy. As an add-on
author, you can take advantage of this type hinting as well.

To get started with your first add-on:

- Open PyCharm and create a new project.

- Right click/ctrl+click on your project on the left and create a new
  Python package called "myaddon"

Now you’ll need to fetch Anki’s bundled source code so you can get type
completion. As of Anki 2.1.24, these are available on PyPI. **You will need to
be using a 64 bit version of Python, version 3.8 or 3.9, or the commands below
will fail**. To install Anki via PyCharm, click on Python Console in the bottom
left and type the following in:

```python
import subprocess

subprocess.check_call(["pip3", "install", "--upgrade", "pip"])
subprocess.check_call(["pip3", "install", "mypy", "aqt"])
```

Hit enter and wait. Once it completes, you should now have code completion.

If you get an error, you are probably not using a 64 bit version of Python,
or your Python version is not 3.8 or 3.9. Try running the commands above
with "-vvv" to get more info.

After installing, try out the code completion by double clicking on the
`__init__.py` file. If you see a spinner down the bottom, wait for it to
complete. Then type in:

```python
from anki import hooks
hooks.
```

and you should see completions pop up.

**Please note that you can not run your add-on from within PyCharm - you
will get errors.** Add-ons need to be run from within Anki, which is
covered in the next section.

You can use mypy to type-check your code, which will catch some cases
where you’ve called Anki functions incorrectly. Click on Terminal in the
bottom left, and type 'mypy myaddon'. After some processing, it will show
a success or tell you any mistakes you’ve made. For example, if you
specified a hook incorrectly:

```python
from aqt import gui_hooks

def myfunc() -> None:
  print("myfunc")

gui_hooks.reviewer_did_show_answer.append(myfunc)
```

Then mypy will report:

    myaddon/__init__.py:5: error: Argument 1 to "append" of "list" has incompatible type "Callable[[], Any]"; expected "Callable[[Card], None]"
    Found 1 error in 1 file (checked 1 source file)

Which is telling you that the hook expects a function which takes a card as
the first argument, eg

```python
from anki.cards import Card

def myfunc(card: Card) -> None:
  print("myfunc")
```

Mypy has a "check_untyped_defs" option that will give you some type checking
even if your own code lacks type hints, but to get the most out of it, you will
need to add type hints to your own code. This can take some initial time, but
pays off in the long term, as it becomes easier to navigate your own code, and
allows you to catch errors in parts of the code you might not regularly exercise
yourself. It is also makes it easier to check for any problems caused by updating
to a newer Anki version.

If you have a large existing add-on, you may wish to look into tools like monkeytype
to automatically add types to your code.

<details>
<summary>Monkeytype</summary>
To use monkeytype with an add-on called 'test', you could do something like the following:

```shell
% /usr/local/bin/python3.8 -m venv pyenv
% cd pyenv && . bin/activate
(pyenv) % pip install aqt monkeytype
(pyenv) % monkeytype run bin/anki
```

Then click around in your add-on to gather the runtime type information, and close
Anki when you're done.

After doing so, you'll need to comment out any top-level actions (such as code modifying
menus outside of a function), as that will trip up monkeytype. Finally, you can
generate the modified files with:

```shell
(pyenv) % PYTHONPATH=~/Library/Application\ Support/Anki2/addons21 monkeytype apply test
```

</details>

Here are some example add-ons that use type hints:

<https://github.com/ankitects/anki-addons/blob/master/demos/>

## Add-on folders

You can access the top level add-ons folder by going to the
Tools&gt;Add-ons menu item in the main Anki window. Click on the View
Files button, and a folder will pop up. If you had no add-ons installed,
the top level add-ons folder will be shown. If you had an add-on
selected, the add-on’s module folder will be shown, and you will need to
go up one level.

The add-ons folder is named "addons21", corresponding to Anki 2.1. If
you have an "addons" folder, it is because you have previously used Anki
2.0.x.

Each add-on uses one folder inside the add-on folder. Anki looks for a
file called `__init__.py` file inside the folder, eg:

    addons21/my_addon/__init__.py

If `__init__.py` does not exist, Anki will ignore the folder.

When choosing a folder name, it is recommended to stick to a-z and 0-9
characters to avoid problems with Python’s module system.

While you can use whatever folder name you wish for folders you create
yourself, when you download an add-on from AnkiWeb, Anki will use the
item’s ID as the folder name, such as:

    addons21/48927303923/__init__.py

Anki will also place a meta.json file in the folder, which keeps track
of the original add-on name, when it was downloaded, and whether it’s
enabled or not.

You should not store user data in the add-on folder, as it’s [deleted
when the user upgrades an add-on](addon-config.md#config-json).

If you followed the steps in the IDE section above, you can either copy
your myaddon folder into Anki’s add-on folder to test it, or a Mac or
Linux, create a symlink from the folder’s original location into your
add-ons folder.

## A Simple Add-On

Add the following to `my_first_addon/__init__.py` in your add-ons folder:

```python
# import the main window object (mw) from aqt
from aqt import mw
# import the "show info" tool from utils.py
from aqt.utils import showInfo, qconnect
# import all of the Qt GUI library
from aqt.qt import *

# We're going to add a menu item below. First we want to create a function to
# be called when the menu item is activated.

def testFunction() -> None:
    # get the number of cards in the current collection, which is stored in
    # the main window
    cardCount = mw.col.cardCount()
    # show a message box
    showInfo("Card count: %d" % cardCount)

# create a new menu item, "test"
action = QAction("test", mw)
# set it to call testFunction when it's clicked
qconnect(action.triggered, testFunction)
# and add it to the tools menu
mw.form.menuTools.addAction(action)
```

Restart Anki, and you should find a 'test' item in the tools menu.
Running it will display a dialog with the card count.

If you make a mistake when entering in the plugin, Anki will show an
error message on startup indicating where the problem is.

## The Collection

All operations on a collection file are accessed via mw.col. Some basic
examples of what you can do follow. Please note that you should put
these in testFunction() as above. You can’t run them directly in an
add-on, as add-ons are initialized during Anki startup, before any
collection or profile has been loaded.

**Get a due card:**

```python
card = mw.col.sched.getCard()
if not card:
    # current deck is finished
```

**Answer the card:**

```python
mw.col.sched.answerCard(card, ease)
```

**Edit a note (append " new" to the end of each field):**

```python
note = card.note()
for (name, value) in note.items():
    note[name] = value + " new"
note.flush()
```

**Get card IDs for notes with tag x:**

```python
ids = mw.col.find_cards("tag:x")
```

**Get question and answer for each of those ids:**

```python
for id in ids:
    card = mw.col.getCard(id)
    question = card.q()
    answer = card.a()
```

**Adjust due dates of reviews**

```python
from anki.consts import QUEUE_TYPE_REV
ids = mw.col.find_cards("is:due")
for id in ids:
    card = mw.col.getCard(id)
    if card.queue == QUEUE_TYPE_REV:
        card.due += 1
        card.flush()
```

**Reset the scheduler after any DB changes. Note that we call reset() on
the main window, since the GUI has to be updated as well:**

```python
mw.reset()
```

**Import a text file into the collection**

```python
from anki.importing import TextImporter
file = u"/path/to/text.txt"
# select deck
did = mw.col.decks.id("ImportDeck")
mw.col.decks.select(did)
# anki defaults to the last note type used in the selected deck
m = mw.col.models.byName("Basic")
deck = mw.col.decks.get(did)
deck['mid'] = m['id']
mw.col.decks.save(deck)
# and puts cards in the last deck used by the note type
mw.col.set_aux_notetype_config(
    self.importer.model["id"], "lastDeck", self.deck.selected_deck_id
)

m['did'] = did
mw.col.models.save(m)
# import into the collection
ti = TextImporter(mw.col, file)
ti.initMapping()
ti.run()
```

Almost every GUI operation has an associated function in anki, so any of
the operations that Anki makes available can also be called in an
add-on.

If you want to access the collection outside of the GUI, you can do so
with the following code:

```python
from anki import Collection
col = Collection("/path/to/collection.anki2")
```

If you make any modifications to the collection outside of Anki, you
must make sure to call col.close() when you’re done, or those changes
will be lost.

## Reading/Writing Objects

Most objects in Anki can be read and written via methods in pylib.

```python
card = col.getCard(card_id)
card.ivl += 1
card.flush()
```

```python
note = col.getNote(note_id)
note["Front"] += " hello"
note.flush()
```

```python
deck = col.decks.get(deck_id)
deck["name"] += " hello"
col.decks.save(deck)

deck = col.decks.byName("Default hello")
...
```

```python
config = col.decks.get_config(config_id)
config["new"]["perDay"] = 20
col.decks.save(config)
```

```python
notetype = col.models.get(notetype_id)
notetype["css"] += "\nbody { background: grey; }\n"
col.models.save(note)

notetype = col.models.byName("Basic")
...
```

You should prefer these methods over directly accessing the database,
as they take care of marking items as requiring a sync, and they prevent
some forms of invalid data from being written to the database.

For locating specific cards and notes, col.find_cards() and
col.find_notes() is useful.

## The Database

:warning: You can easily cause problems by writing directly to the database.
Where possible, please use the methods mentioned above instead.

Anki’s DB object supports the following functions:

**scalar() returns a single item:**

```python
showInfo("card count: %d" % mw.col.db.scalar("select count() from cards"))
```

**list() returns a list of the first column in each row, eg \[1, 2,
3\]:**

```python
ids = mw.col.db.list("select id from cards limit 3")
```

**all() returns a list of rows, where each row is a list:**

```python
ids_and_ivl = mw.col.db.all("select id, ivl from cards")
```

**execute() can also be used to iterate over a result set without
building an intermediate list. eg:**

```python
for id, ivl in mw.col.db.execute("select id, ivl from cards limit 3"):
    showInfo("card id %d has ivl %d" % (id, ivl))
```

**execute() allows you to perform an insert or update operation. Use
named arguments with ?. eg:**

```python
mw.col.db.execute("update cards set ivl = ? where id = ?", newIvl, cardId)
```

Note that these changes won't sync, as they would if you used the functions
mentioned in the previous section.

**executemany() allows you to perform bulk update or insert operations.
For large updates, this is much faster than calling execute() for each
data point. eg:**

```python
data = [[newIvl1, cardId1], [newIvl2, cardId2]]
mw.col.db.executemany(same_sql_as_above, data)
```

As above, these changes won't sync.

Add-ons should never modify the schema of existing tables, as that may
break future versions of Anki.

If you need to store addon-specific data, consider using Anki’s
[Configuration](addon-config.md#config-json) support.

If you need the data to sync across devices, small options can be stored
within mw.col.conf. Please don’t store large amounts of data there, as
it’s currently sent on every sync.
