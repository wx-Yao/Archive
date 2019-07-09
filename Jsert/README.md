# Jsert: stupid tool that MAY be useful in rare cases.

What it does is simply adds blank pages after each page in a PDF file. It's particularly useful when you have a normal PDF and you wanna print it out but you want it to be single-paged. Sometimes a printer couldn't be configured to do that (like the ones in my university) so ... that's how it helps. Other than that, I don't see any use case.

# Usage

- To modify the code and recompile: (sure you don't need to) `./compile.sh`

- To use it: `java -jar Jsert.jar <pdf1> <pdf2>...`

- By default the JAR will create a separate file (i.e., `example.pdf` -> `example.out.pdf`). If you're sure to overwrite the original one, use `java -jar -r Jsert.jar <pdf1> <pdf2>...`

- Use `-v` to be verbose.

# I said it was stupid because

1. If you're running with overwrite mode, don't run that command twice:). It'll keep adding blank pages no matter what.

2. For some strange class path issue, this JAR doesn't run anywhere. I expected a binary that can be put to like `/usr/bin` or something. But it seems like the JAR couldn't figure out where the dependencies are once he leaves this directory. So don't move the JAR file out. But you can execute it in other directory. e.g., You're in other directories other than `Jsert`. You can do `java -jar /path/to/Jsert/Jsert.jar`.

3. Don't use `--r` and `--v` or `--rv` together. You'll get strange alert.

4. I'm not gonna fix them because they're too stupid...

