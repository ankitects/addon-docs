## Translations

- 日本語: <http://rs.luminousspice.com/ankiaddons21/>

## Overview

Anki is primarily written in a user-friendly language called Python. If
you’re not familiar with Python, please read the [Python
tutorial](http://docs.python.org/tutorial/) before proceeding with the
rest of this document.

Because Python is a dynamic language, add-ons are extremely powerful in
Anki - not only can they extend the program, but they can also modify
arbitrary aspects of it, such as altering the way scheduling works,
modifying the UI, and so on.

While it is possible to develop Anki add-ons with just a plain text
editor, you can make your life easier by using a proper code editor/IDE
- please see the IDE & Type Hints section below for more information.

Anki is comprised of two parts:

'anki' in the pylib folder contains most of the "backend" code - opening
collections, fetching and answering cards, and so on. It is used by
Anki’s GUI, and can also be included in command line programs to access
Anki decks without the GUI.

'aqt' in the qt folder contains the UI part of Anki. Anki’s UI is built
upon PyQt, Python bindings for the cross-platform GUI toolkit Qt. PyQt
follows Qt’s API very closely, so the documentation can be very useful
when you want to know how to use a particular GUI component.

Anki 2.1.x uses [Qt 5.9/5.12/5.14](http://doc.qt.io/qt-5/index.html)
depending on the build.

When Anki starts up, it checks for modules in the add-ons folder, and
runs each one it finds. When add-ons are run, they typically modify
existing code or add new menu items to provide a new feature.
