#/bin/bash

echo "Start to Compile..."
echo ------------------------
javac -cp lib/itextpdf-5.4.1.jar:lib/jcommander-1.72.jar -d . Jsert.java
if [ $? -eq 0 ]
then
    echo "Compile Success. Building JAR file"
    echo ------------------------
    jar cvmf Jsert.mf Jsert.jar Jsert.class lib
    echo "Now you can execute with 'java -jar Jsert.jar'"
fi

