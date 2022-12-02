# Python Modules

From Anki 2.1.50, the packaged builds include most built-in [Python
modules](https://www.scaler.com/topics/python/python-modules/). Earlier versions ship with only the standard modules necessary to run Anki.

If your add-on uses a standard Python module that has not
been included, or a package from PyPI, then your add-on will need to bundle the module.

For pure Python modules, this is usually as simple as putting them in a
subfolder, and adjusting sys.path. For modules that that require C extensions
such as numpy, things get a fair bit more complicated, as you'll need to bundle
the different module versions for each platform, and ensure you're bundling a
version that is compatible with the version of Python Anki is packaged with.
