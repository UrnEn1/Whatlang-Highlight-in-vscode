import * as vscode from 'vscode';
import { DebugSession, StoppedEvent, OutputEvent } from 'vscode-debugadapter';
import { InterpreterHook } from './interpreterHook';

class MyJSDebugSession extends DebugSession {
  private _interpreter: InterpreterHook;

  constructor() {
    super();
    this._interpreter = new InterpreterHook();
    // 监听解释器事件
    this._interpreter.on('breakpointHit', (file, line) => {
      this.sendEvent(new StoppedEvent('breakpoint', file + ':' + line));
    });
  }

  // 处理设置断点请求
  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ) {
    const path = args.source.path!;
    const breakpoints = args.breakpoints || [];
    this._interpreter.setBreakpoints(path, breakpoints.map(bp => bp.line));
    response.body = { breakpoints: breakpoints.map(validated) };
    this.sendResponse(response);
  }

  // 启动调试会话
  protected launchRequest(response: DebugProtocol.LaunchResponse, args: any) {
    this._interpreter.start(args.program); // 启动解释器执行目标文件
    this.sendEvent(new OutputEvent('Debugger attached\n'));
    this.sendResponse(response);
  }
}