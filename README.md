# Nous Tale

A native desktop app to build amazing (and probably funnny) stories with your friends. Made with Angular and Electron, people will build *chain* stories that will later be narrated by a voice synthetizer. Dynamic image selection via public API is yet to be confirmed.

## Frameworks

### Front
For the front aspect of the app environment, we chose **Electron** and **Angular**.

*Why Electron?*  

Electron offers a straight-forward, highly customizable solution for the front. It's as cross-platform as it gets as a desktop application, and paired with Angular it results in a robust solution that's easily posted on a web, changing almost no code.

### Back
For the back, we'll make a **Web Socket based ASP.NET API**.

*Why ASP.NET?*  

As much as we like learning new frameworks, making the front on Electron already pushes a tad the learning curve making this project. For that, even if this is not the most popular solution, We'll be using our beloved ASP.
*C#* and an easy *MVC* implementation will make our experience a lot more confortable making this project.

*Web Sockets? What are those?*  

Web Sockets make uninterrupted, real-time connections possible between server and the clients. This allows a smooth multiplayer experience. There are *NuGet* packages that wrap the lower level part of making one of these, so this is not a hard task.

## Server
As said earlier, it will be an ASP.NET Web Socket API server, using JSON message communication and **SignalR** as real-time library.

*What's SignalR?*

SignalR is the most powerful real-time back-end development library in .NET Core. It has 4 main ways to maintain this communication (from more to less instant):
- Web Socket
- Event Source
- Forever Frame
- Long Polling (simulates real-time)

When SignalR recieves a request, it tries them in order. The most optimal one is using WebSockets, but if that doesn't work, it downgrades automatically to the lower tier and so on.

The most awesome part is that SignalR is an almost perfect abstraction to all these technologies, and we don't even need to think about how it works inside.

