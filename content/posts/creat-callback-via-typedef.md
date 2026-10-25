---
{
  "title": "Dart: Create callback via typedef",
  "slug": "creat-callback-via-typedef",
  "description": "Define and use callbacks with Dart typedefs.",
  "date": "2019-05-26",
  "topic": "Dart",
  "tags": [
    "dart"
  ],
  "draft": false,
  "legacyUrls": [
    "/dart/2019/05/26/creat-callback-via-typedef.html",
    "/dart/2019/05/25/creat-callback-via-typedef.html"
  ],
  "source": "https://github.com/rahul-lohra/myblog/blob/main/_posts/dart/2019-05-26-creat-callback-via-typedef.md"
}
---



Let’s say we have a `Button` class and it has a `count` property(member-variable), and a method `tap()`. Whenever we call the `tap()` function, we **increment** the count and ***send a callback back to caller function.***

## Typical callback code From Java

```java
public class Button {
 
 int _count = 0;
 ButtonCallback callback;
 void tap(){
     ++_count;
     if(callback!=null && (_count%2) == 0){
         callback.onTrigger(_count);
      }
  }
 void setCallback(ButtonCallback callback){
     this.callback = callback;
 }
 public interface ButtonCallback {
    void onTrigger(int a);
 }
}
```
Unfortunately **Dart** doesn’t have **`interface`** like **Java**. But it supports functional programming: So **we can just pass `function` as `arguments`. *This is what we need to do for creating callbacks***

## Here is the Dart Code
```dart
public class Button {
  int _count = 0;
  Function(int) callback;
  
  void tap(){
     ++_count;
     if(callback!=null && (_count%2) == 0){
         callback(_count));
      }
    }
  void setCallback(Function(int) f){
    this.callback = f;
  }
}

//Main starts
main (List<String> args){ 
  Button button = new Button();
  button.setCallback((a){
    print(a);
});
for(int i=0;i<4;++i){
  button.tap();
 }
}
//Main Ends
```

<p align="center">
  <img alt="Illustration from the original article" src="/assets/b7703bc8b46633.png" />
  <br>
  Output in console
</p>


> **Code**: [https://gist.github.com/rahul-lohra/6f3561221564a346d060d58aabe8b659](https://gist.github.com/rahul-lohra/6f3561221564a346d060d58aabe8b659)

## A typedef function looks like this
```dart
  Function(int) callback
```

Official definition of typedef: [https://dart.dev/guides/language/language-tour#typedefs](https://dart.dev/guides/language/language-tour#typedefs)

It says they are like objects and you can assign it to a variable or pass it as function arguments.

That’s it
