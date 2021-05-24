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
. Please see the IDE & Type Hints section below for more information.

When Anki starts up, it checks for modules in the add-ons folder, and
runs each one it finds. When add-ons are run, they typically modify
existing code or add new menu items to provide a new feature.

## The parts of anki
Anki code is generally divised in front-end and back-end as follow:

### Front-end

The front-end of Anki is written in PyQt, and this PyQt shows a lot of web views, using html, css and typescript.

'aqt' in the qt folder contains the UI part of Anki. Anki’s UI is built
upon PyQt, Python bindings for the cross-platform GUI toolkit Qt. PyQt
follows Qt’s API very closely, so the documentation can be very useful
when you want to know how to use a particular GUI component.

Anki 2.1.x uses [Qt 5.9/5.12/5.14](http://doc.qt.io/qt-5/index.html)
depending on the build.

'ts' is the folder that contain most code that manipulate user-generated content,
in particular the cards back and front, the note editor, the deck picker, some stats...

### Back-end

'anki' in the pylib folder contains most of the "backend" code - opening
collections, fetching and answering cards, and so on. It is used by
Anki’s GUI, and can also be included in command line programs to access
Anki decks without the GUI.

'backend.proto' in the rslib folder is the file where most important data types used in the background are defined. You do not have to know [protobuf](https://developers.google.com/protocol-buffers/docs/pythontutorial) to create add-ons. Instead, if you see an object of type `DeckConfig` for example, you can usually consider it as a simple python object and uses 'rslib/backend.proto' to find the list of its fields. This file also contains the API of the rust back-end, that is, the list of functions implemented in Rust that an add-on can call. Most of those functions should be callable directly from the 'anki' library.
