import { render } from "preact";
import { localBackend, Store } from "./core/storage";
import { App } from "./ui/App";
import "./index.css";

render(<App store={new Store(localBackend())} />, document.getElementById("root")!);
