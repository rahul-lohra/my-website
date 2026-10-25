---
{
  "title": "Intellij Plugin: Create Gql Formatter Plugin",
  "slug": "create-gql-formatter-plugin",
  "description": "Build an IntelliJ plugin to format GraphQL queries, from the UI to parsing and publishing.",
  "date": "2020-07-19",
  "topic": "Developer tools",
  "tags": [
    "plugin"
  ],
  "draft": false,
  "legacyUrls": [
    "/plugin/2020/07/19/create-gql-formatter-plugin.html",
    "/plugin/2020/07/18/create-gql-formatter-plugin.html"
  ],
  "source": "https://github.com/rahul-lohra/myblog/blob/main/_posts/plugins/2020-07-19-create-gql-formatter-plugin.md"
}
---

We will create a GQL Formatter Plugin

This is what we are going to create: 
Plugin link: [https://plugins.jetbrains.com/plugin/14709-gql-formatter/versions/stable/92155](https://plugins.jetbrains.com/plugin/14709-gql-formatter/versions/stable/92155)
Full source code: [https://github.com/rahul-lohra/gql-formatter-plugin](https://github.com/rahul-lohra/gql-formatter-plugin)

### Before formatting is applied

<div class="big-pic-div">
<img alt="Illustration from the original article" class="big-pic" src="/assets/8a668a0107b41f.png" />
</div>
<br>

### After formatting is applied

<div class="big-pic-div">
<img alt="Illustration from the original article" class="big-pic" src="/assets/859eef11d00c27.png" />
</div>
<br>

The language used is **Kotlin** but the concepts will remain same so don’t worry if you don’t know Kotlin

What it does:
1. It will reformat your GQL query that is stored in some variable (The idea is very similar to JSON Formatter)
2. You can then replace this formatted GQL query into that variable

What do we need to do to build this
1. We will need a UI where we will see our formatted code
2. We need to read the code from the file
3. We need to write th formatted code back to the file and override the variable’s value

Concepts that will be used:
1. Editor
2. Tool windows (Swing GUI)
3. File Reading/Writing via PsiElementVisitor
4. Creating PsiElement (String template)

Why do we need it:
To keep our GQL query code consistent across our project and it is also readable now

We have to cover these parts:
1. Setup basic project to develop plugin
2. Create UI where we will see our formatted Code
3. Format GQL query with our code
4. Paste the code back to the source code from your tool window
5. Few things about publishing plugin

## 1. Setup Basic Project

![](/assets/0acc92e5adea1f.png)

![](/assets/454a999ee54751.png)

Click on the **finish**. Beware this project will download at least ***500mb*** of data for every time you will create an IntelliJ Platform Plugin. Actually it will download IntelliJ SDK.

But we can avoid that and use from local *(This is totally optional)*

Original(default) build.gradle

```kotlin
plugins {
    id 'java'
    id 'org.jetbrains.intellij' version '0.4.21'
}

group 'org.example'
version '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    testCompile group: 'junit', name: 'junit', version: '4.12'
}

intellij {
    version '2020.1.1' // this is reason for 500mb download
}
...
```

Now we need to pass local path of IntelliJ like below:

```kotlin
intellij {
    localPath "/home/rahulkumarlohra-xps/IdeaProjects/ideaIC-2020.1"
}
//If you get some errors like annotations not found then make them available like this
dependencies {
    compile group: 'org.jetbrains', name: 'annotations', version: '19.0.0'
}
```

Like to build.gradle: [https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/build.gradle](https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/build.gradle)

Let’s see one more file which is auto-created: ***plugin.xml***


**plugin.xml**

```xml
<idea-plugin>
    <id>com.awesome.formatter</id> <!--Enter your package, it should be unique-->
    <name>Awesome GQL Formatter</name>
    <vendor email="tgunix@gmail.com" url="http://www.rahullohra.com">RahulLohra</vendor>

    <description><![CDATA[
      Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum.<br>
      Lorem ipsum
    ]]></description>

    <!-- please see https://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/plugin_compatibility.html
         on how to target different products -->
    <depends>com.intellij.modules.platform</depends>

    <extensions defaultExtensionNs="com.intellij">
        <!-- Add your extensions here -->
    </extensions>

    <actions>
        <!-- Add your actions here -->
    </actions>
</idea-plugin>
```


You might get some error initially, it is basically like a warning that you should enter the values for `name,description,vendor details`

**Few tips**:
1. `id`: Should be your package name and should be unique 
2. `description`: You can use **HTML** tags here

## 2. Create UI where we will see our formatted Code

This is what we will create

![](/assets/1d9f41f5372e8e.png)

Functionalities of this tool:
1. **Import**: It will get the value stored in the variable which is provided in this white box
2. **Replace**: It will set back the formatted value to the original source code file

This is how it will look once we have filled some values on it

<div class="big-pic-div">
<img alt="Illustration from the original article" class="big-pic" src="/assets/af643ee1dc9a60.png" />
</div>
<br>

> **(Optional)**We are going to create a **Swing GUI**. If you are new to Swing GUI then watch this video to understand how to create Swing GUI : [https://www.youtube.com/watch?v=5vSyylPPEko](https://www.youtube.com/watch?v=5vSyylPPEko)

### Follow these steps to create the UI

![](/assets/656c1b5038918c.png)

<div style="text-align:center">
    <img alt="Illustration from the original article" src="/assets/a75f8fbcba1423.png">
</div>


After tapping on **OK : Two files will be created for and those are:**
1. GqlView.java
2. GqlView.form

### GqlView.java

This file will contain all the UI elements as member variables and you can add listeners to these views


**GqlView.java**

```java
package com.rahul.gqlformat;
import com.intellij.openapi.project.Project;

import javax.swing.*;

public class GqlView {
    private JTextArea textArea;
    private JButton btnImport;
    private JPanel panel;
    private JTextField tfVariableName;
    private JButton btnReplace;
    private JLabel labelError;
    private Project project;
}

```


All the member variables are auto-generated and they automatically linked with their respective UIs

### GqlView.form
This is actually an XML file that contains all the Swing UI elements and also how each one they are relatively placed(positioned) 
The IDE generally do not allow us to directly edit this XML file. It has its own drag and drop user interface to create the UI. In the below picture, you can see the 
1. Palette window to the extreme right.
2. Component Tree
3. Actual UI

This is how the GqlView.form should look **initially**, right after it is created

<div class="big-pic-div">
<img alt="Illustration from the original article" class="big-pic" src="/assets/ff85ead8460955.png" />
</div>
<br>

Use this ***Two code snippets*** to **create the final UI**
1. [https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/src/main/java/com/rahul/gqlformat/GqlView.form](https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/src/main/java/com/rahul/gqlformat/GqlView.form)

After copy-pasting the content we should see UI like this:

<div class="big-pic-div">
<img alt="Illustration from the original article" class="big-pic" src="/assets/7fdcec6dfd6988.png" />
</div>

<br>
Since we have manually edited the GqlView.form so that’s why we also need to manually edit the GqlView


**GqlView.java**

```java
package com.rahul.gqlformat;
import com.intellij.openapi.project.Project;

import javax.swing.*;

public class GqlView {
    private JTextArea textArea;
    private JButton btnImport;
    private JPanel panel;
    private JTextField tfVariableName;
    private JButton btnReplace;
    private JLabel labelError;
    private Project project;
}

```


The UI should be ready now

### Add this UI to a Tool Window

Things to do
1. Create a class that will be registered as Tool Window (creation + registration)
2. That class should also render the UI that we just created (Connect that class to our UI class)

### Create Toolwindow


**MyToolWindow.kt**

```kotlin
package com.rahul.gqlformat

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory

class MyToolWindow : ToolWindowFactory {

    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val view = GqlView(project)
        val contentFactory = ContentFactory.SERVICE.getInstance()
        val content = contentFactory.createContent(view.panel, "", false)
        toolWindow.contentManager.addContent(content)
    }
}
```


We have 2 things
1. Implement `ToolWindowFactory`: this class will be registered later
2. `override createToolWindowContent` : In this method, we are just attaching the UI to this `Toolwindow`

Register the `Toolwindow` like below on ***plugin.xml***


**plugin.xml**

```xml
</idea-plugin> 
     
    <extensions defaultExtensionNs="com.intellij">
        <toolWindow
                id="Gql Format" anchor="right" factoryClass="com.rahul.gqlformat.MyToolWindow">
        </toolWindow>
    </extensions>
</idea-plugin>
```


1. `id`: It will be the name displayed over your `toolwindow`
2. `anchor`: Position where the toolwindow will be displayed
3. `factoryClass`: Points to our newly created `ToolWindowclass`

## 3. Format GQL Query with our code

I have already written code for this. No explanation needed, but you can see some of the examples of GQL query to get an idea of that: [https://graphql.org/learn/queries/](https://graphql.org/learn/queries/)

This is my code(might be difficult to understand so feel free to skip it): [https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/src/main/java/com/rahul/gqlformat/parser/NodeCreator.kt](https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/src/main/java/com/rahul/gqlformat/parser/NodeCreator.kt)

Let’s just say we have an API to get formatted GQL Query:

    val nodeCreator = NodeCreator()
    val node = nodeCreator.createNode(unformatted text)
    val nodeText = nodeCreator.prettyPrint2(node, offset)

The nodeText will return the formatted GQL query

Now we need some logic(or API) to get variable’s value which is in our kotlin file. You can say we have to parse our code and extract the necessary information. To do this we have to understand a new concept **PSI** (It’s super easy don’t worry)
> **PSI** : Program Structure Interface : Its responsible for **parsing** your file and getting **meaningful data** from it. Like it you can directly go to any comments, or variables or any functions. (link: [https://jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi.html](https://jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi.html))

**PsiElements**: A file is represented as ***tress of PsiElements***. (link: [https://jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi_elements.html](https://jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi_elements.html)). It is very similar to the Tree data structure where you have many nodes connected to each other and every node might have some special property. Eg one of them can be a function or a comment or a class name or a string value or import statements

**To visually see how it looks you can do this**
1. Navigate to any file
2. Tools -> View PSI Structure of Current file

![](/assets/18c18a4e1e278b.png)

Now we need a way to ***navigate*** through this PSI elements and find our variable where the String is stored

We will use **`KtTreeVisitorVoid`** from `package org.jetbrains.kotlin.psi`. It will help to navigate through **Kotlin’s PSI Element**. If you want to parse a Java file then you can use `JavaRecursiveElementVisitor`.
> To use **`KtTreeVisitorVoid`** we have to add its dependency. One thing to note is we need to add dependency on `plugin.xml` but **not on** `build.gradle`, like this:

    <idea-plugin>
    ....
        <depends>org.jetbrains.kotlin</depends>

        <extensions defaultExtensionNs="com.intellij">
             <toolWindow
                id="Gql Format" anchor="right" factoryClass="com.rahul.gqlformat.MyToolWindow">
             </toolWindow>
        </extensions>
    ....

    </idea-plugin>

Here is the documentation of plugin dependencies: [https://jetbrains.org/intellij/sdk/docs/basics/getting_started/plugin_compatibility.html#declaring-plugin-dependencies](https://jetbrains.org/intellij/sdk/docs/basics/getting_started/plugin_compatibility.html#declaring-plugin-dependencies)

### Add logic to parse the file

We will create a class named EditorLogic.kt : it is responsible for
1. Get **currently opened** file
2. **Traversing** the code 
3. **Extract** the value assigned in variable 
4. **Pass** that value to our NodeCreater (it will reformat the GQL)
5. **Paste** the formatted value into the ToolWindow
6. **Replace** the original value with our formatted value from ToolWindow

1. Currently opened file: will use FileEditorManager to get current PsiFile

1. Code Traversal: we will use KtTreeVisitorVoid

1. Value Extraction: override visitProperty(property:KtPropery)

1. Passing value does not require any explanation

1. Pasting value to our Toolwindow: we will do this : textArea.text=”our formatted text”


**EditorLogic.kt**

```kotlin
class EditorLogic {
val nodeCreator = NodeCreator()
var expressionElement: PsiElement? = null

  fun selectCurrentFile(variableName: String, project: Project, textArea: JTextArea) {
        reset()

        val fileEditorManager = FileEditorManager.getInstance(project)
        val virtualFile = fileEditorManager.openFiles

        if (!virtualFile.isNullOrEmpty()) {

            val vf = fileEditorManager.selectedEditor?.file
            vf?.let { file ->
                val psiFile = PsiManager.getInstance(project).findFile(file)
                if (psiFile != null) {
                    psiFile.accept(javaVisitor(textArea))
                    kotlinVisitor(variableName, textArea, psiFile)
                }
            }
        }
    }

  fun kotlinVisitor(variableName: String, textArea: JTextArea, psiFile: PsiFile) {

        psiFile.accept(object : KtTreeVisitorVoid() {

            override fun visitProperty(property: KtProperty) {
                super.visitProperty(property) //yes
                val localVariableName = property.name
                if (property.type().toString() == "String" && localVariableName == variableName) {                   
                    val expressionElement = property.lastChild
                    this@EditorLogic.expressionElement = expressionElement
                    textArea.text = findTextInVariable(expressionElement)
                }
            }
        })
    }
  
  fun findTextInVariable(psiElement: PsiElement): String {
        when (psiElement) {
            is KtStringTemplateExpression -> {
                val text = getTextFromKtStringTemplateExpression(psiElement)
                val node = nodeCreator.createNode(text.replace("\\n", ""))
                return nodeCreator.prettyPrint2(node)
            }
            is KtBinaryExpression -> {
                val array = psiElement.text.split("+")
                val sb = StringBuilder()
                for (item in array) {
                    sb.append(
                        item.replaceFirst("\"", "")
                            .replace("\\t", "")
                            .replace("\\n", "")
                            .replace("\\", "")
                            .trimEnd()
                            .removeSuffix("\"")
                    )
                }
                val node = nodeCreator.createNode(sb.toString().replace("\\n", ""))
                return nodeCreator.prettyPrint2(node)
            }
            is KtDotQualifiedExpression -> {
                if (psiElement.firstChild is KtStringTemplateExpression) {
                    return findTextInVariable(psiElement.firstChild)
                }
            }
        }
        //todo Rahul throw exception - not supported
        return "Type not supported"
    }
  
  fun reset() {
        expressionElement = null
    }
}

```

<br>

<div style="display:flex">
    <img alt="Illustration from the original article" src="/assets/304a1a54f57072.png">
    <div style="margin-left:16px;
    margin-top:40%">
        <p>This diagram will be useful to understand the code flow from our input till we paste the formatted code to our tool window</p>       
    </div>
</div>
<br>

Explanation of keywords:
1. `KtBinaryExpression`
2. `KtStringTemplateExpression`
3. `KtDotQualifiedExpression`
Our intention is to ***extract the assigned value***(String) from the variable. But the assigned value can be of above different types(there can be more)
Here are the examples for the above elements

![](/assets/145e7ef8e14e5c.png)

Now we need to see how we are ***passing the variable name***. It’s a simple click event added on the button Import of our ToolWindow

![](/assets/fac41fa912557a.png)


**GqlView.java**

```java
package com.rahul.gqlformat;

import com.intellij.openapi.project.Project;
import org.apache.http.util.TextUtils;

import javax.swing.*;

public class GqlView {
    private JTextArea textArea;
    private JButton btnImport;
    private JPanel panel;
    private JTextField tfVariableName;
    private JButton btnReplace;
    private JLabel labelError;
    private Project project;
    private EditorLogic editorLogic;
    Timer errorTimer;

    public GqlView(Project project) {
        this.editorLogic = new EditorLogic();
        this.project = project;

        btnImport.addActionListener(actionEvent -> {
            String variableName = tfVariableName.getText();
            if (TextUtils.isEmpty(variableName)) {
                //Do nothing
            } else {
                editorLogic.selectCurrentFile(variableName, project, textArea);
            }
        });
    }
    public JPanel getPanel() {
        return panel;
    }
}
```


Cool now we should be able to at least see the formatted GQL query in our tool window

## 4. Paste the formatted GQL query back to our file

Things to do:
1. **Replace existing `PsiElement` with formatted `String`:** Means we have to *create a new PsiElement* and will need to store formatted String into it and then need to replace it with the original PsiElement which has an unformatted query
2. **Use proper indent**(optional)
3. **Handle dollar sign**: because Kotlin treats dollar sign in a different way, for eg it can be used as a placeholder and much more

### Replacing PsiElement

API to replace `PsiElement` is very simple:

    PsiElement.resplace(newPsiElement)

And we just need to wrap this inside another block else we will get exceptions:

```kotlin
WriteCommandAction.runWriteCommandAction(project) {
    oldPsiElemet.replace(newPsiElement)
}
```

This is how we are creating `newPsiElement`
```kotlin
val newPsiElement = KtPsiFactory(psiElement.project).createStringTemplate(text)
```

### Use proper indent

We need to know where should we start our string. In the below figure we need to know how ***FAR the variable is from the left***

![](/assets/ed044f7f4cdb10.png)

We have an api for this: it will tell give us the column no(start point) of the variable

```kotlin
val editor = FileEditorManager.getInstance(psiElement.project).selectedTextEditor
val variableCol = (editor as EditorImpl).offsetToLogicalPosition(psiElement.parent.textOffset).column
```

Here the PsiElemt refers to the String value, that’s why we have taken `psiElement.parent`

### Dollar Sign

1. As of now, we are changing `$` to `${“$”}`
2. `${“$”}` will be ignored

We have used regular expression for this, the code might look difficult, but it's very easy, just go through it doesn’t require any explanation


**EditorLogic.kt**

```kotlin
fun replaceDollar(inputString: String):String{
        var finalText = inputString
        val indexesToIgnore = hashSetOf<Int>()
        val patternsToIgnore = arrayListOf("\\$\\$","\\$\\{\"\\$\"}")

        patternsToIgnore.forEach {
            val doubleDollarPattern = Pattern.compile(it)
            val matcher = doubleDollarPattern.matcher(inputString)

            while (matcher.find()) {
                val startIndex = matcher.start()
                val endIndex = matcher.end()
                for (i in startIndex..endIndex) {
                    indexesToIgnore.add(i)
                }
            }
        }

        val replaceValue = "\${\"$\"}"
        val dollarRegex = "\\$"
        val dollarLength = 1
        val dollarPattern = Pattern.compile(dollarRegex)
        val dollarMatcher = dollarPattern.matcher(inputString)

        var replaceCount = 0
        while (dollarMatcher.find()) {
            val startIndex = dollarMatcher.start()
            if (!indexesToIgnore.contains(startIndex)) {
                val offset =   replaceCount * (replaceValue.length - dollarLength)
                finalText = finalText.replaceRange(startIndex + offset, startIndex + offset + dollarLength, replaceValue)
                replaceCount += 1
            }
        }
        return finalText
    }
```


Cool.. we have covered all the logics. In short, this is what we did:

![](/assets/8ba623137f4b8a.png)

Full source code of EditorLogic.kt : [https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/src/main/java/com/rahul/gqlformat/EditorLogic.kt](https://github.com/rahul-lohra/gql-formatter-plugin/blob/master/src/main/java/com/rahul/gqlformat/EditorLogic.kt)

## 5. Few things about publishing plugin

This is very straight forward and easy and there are multiple ways to upload.

From Gradle: [https://jetbrains.org/intellij/sdk/docs/tutorials/build_system/deployment.html](https://jetbrains.org/intellij/sdk/docs/tutorials/build_system/deployment.html)

I am showing you the simplest one. 
You can follow this guide: [https://jetbrains.org/intellij/sdk/docs/basics/getting_started/publishing_plugin.html](https://jetbrains.org/intellij/sdk/docs/basics/getting_started/publishing_plugin.html)
It is basically
1. Login to JetBrains account
2. Choose upload plugin
3. A form will be displayed and it will ask for jar/zip
You can run this command from your root project to get the jar/zip

```kotlin
./gradlew buildPlugin
```

This will create a zip or jar in **build/distributions/plugin-name.jar**

You can upload this file on their site

After uploading the plugin, kindly fill as much information about your plugin as you can. 
Like: How to use, what things are supported, put screenshots, video links else the reviewer will tell these things to you

Full source code: [https://github.com/rahul-lohra/gql-formatter-plugin](https://github.com/rahul-lohra/gql-formatter-plugin)

Plugin link: [https://plugins.jetbrains.com/plugin/14709-gql-formatter/versions/stable/92155](https://plugins.jetbrains.com/plugin/14709-gql-formatter/versions/stable/92155)

Thanks for reading
Please feel free to correct anything if something is wrong
