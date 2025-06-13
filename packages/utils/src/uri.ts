import { isNil } from "./is";
import type { O } from "./types";

export class URI {
  /** 锚点 */
  public hash: string;
  /** 端口 */
  public port: string;
  /** 路径 */
  public path: string;
  /** 主机名 */
  public hostname: string;
  /** 协议 */
  public protocol: string;
  /** 查询参数 */
  protected _search: Record<string, string[]>;

  /**
   * 构造函数
   */
  constructor() {
    this.path = "";
    this.port = "";
    this.hash = "";
    this._search = {};
    this.hostname = "";
    this.protocol = "";
  }

  /**
   * 主机
   * @returns hostname + port
   */
  public get host(): string {
    const port = this.port ? ":" + this.port : "";
    return this.hostname + port;
  }

  /**
   * 来源
   * @returns protocol + hostname + port
   */
  public get origin(): string {
    const protocol = this.protocol ? this.protocol + "//" : "";
    return protocol + this.host;
  }

  /**
   * 查询参数
   * @returns ?key=value&key=value
   */
  public get search(): string {
    const nodes: string[] = [];
    for (const [key, value] of Object.entries(this._search)) {
      value.forEach(v => nodes.push(key + "=" + v));
    }
    if (!nodes.length) return "";
    return "?" + nodes.join("&");
  }

  /**
   * 链接
   * @returns protocol + hostname + port + path + search + hash
   */
  public get href(): string {
    return this.format();
  }

  /**
   * 设置协议
   * @param protocol
   */
  public setProtocol(protocol: string): this {
    this.protocol = protocol.endsWith(":") ? protocol : protocol + ":";
    return this;
  }

  /**
   * 设置主机名
   * @param hostname
   */
  public setHostname(hostname: string): this {
    this.hostname = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
    return this;
  }

  /**
   * 设置端口
   * @param port
   */
  public setPort(port: string): this {
    this.port = port;
    return this;
  }

  /**
   * 设置路径
   * @param path
   */
  public setPath(path: string): this {
    this.path = path.startsWith("/") ? path : "/" + path;
    return this;
  }

  /**
   * 设置锚点
   * @param hash
   */
  public setHash(hash: string): this {
    if (!hash || hash === "#") {
      this.hash = "";
      return this;
    }
    this.hash = hash.startsWith("#") ? hash : "#" + hash;
    return this;
  }

  /**
   * 获取查询参数
   * @param key
   */
  public pick(key: string): string | null {
    const value = this._search[key];
    return value && value.length ? value[0] : null;
  }

  /**
   * 获取所有查询参数
   * @param key
   */
  public pickAll(key: string): string[] {
    const value = this._search[key];
    return value || [];
  }

  /**
   * 分配查询参数
   * @param key
   * @param value
   */
  public assign(key: string, value: string): this {
    if (!key || isNil(value)) {
      return this;
    }
    this._search[key] = [value];
    return this;
  }

  /**
   * 追加查询参数
   * @param key
   * @param value
   */
  public append(key: string, value: string): this {
    if (!key || isNil(value)) {
      return this;
    }
    if (!this._search[key]) {
      this._search[key] = [];
    }
    this._search[key].push(value);
    return this;
  }

  /**
   * 删除查询参数
   * @param key
   */
  public omit(key: string): this {
    delete this._search[key];
    return this;
  }

  /**
   * 输出格式化链接
   */
  public format(): string {
    return this.origin + this.path + this.search + this.hash;
  }

  /**
   * 从 Location 解析
   * @param location
   */
  public static from(location: Location): URI {
    const instance = URI.parseParams(location.search);
    instance.setPath(location.pathname);
    instance.setProtocol(location.protocol);
    instance.setHostname(location.hostname);
    instance.setPort(location.port);
    instance.setHash(location.hash);
    return instance;
  }

  /**
   * 解析完整链接
   * @param uri
   * @param baseUrl
   * @example https://www.google.com:333/search?q=1&q=2&w=3#world
   */
  public static parse(this: typeof URI, uri: string, baseUrl?: string): URI {
    const url = new URL(uri, baseUrl);
    const instance = new this();
    instance.setProtocol(url.protocol);
    instance.setHostname(url.hostname);
    instance.setPort(url.port);
    instance.setPath(url.pathname);
    instance.setHash(url.hash);
    for (const [key, value] of url.searchParams.entries()) {
      instance.append(key, value);
    }
    return instance;
  }

  /**
   * 解析查询参数
   * @param query
   * @example ?q=1&w=3
   */
  public static parseParams(query: ConstructorParameters<typeof URLSearchParams>["0"]): URI {
    const search = new URLSearchParams(query);
    const instance = new URI();
    for (const [key, value] of search.entries()) {
      instance.append(key, value);
    }
    return instance;
  }

  /**
   * 从路径解析数据
   * @param path
   * @param template
   * @example ("/user/123", "/user/:id") => { id: "123" }
   */
  public static parsePathParams(path: string, template: string): Record<string, string> {
    const pathValue = path.startsWith("/") ? path.slice(1) : path;
    const templateValue = template.startsWith("/") ? template.slice(1) : template;
    const keys = templateValue.split("/");
    const values = pathValue.split("/");
    const len = Math.min(keys.length, values.length);
    const result: Record<string, string> = {};
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const value = values[i];
      // 参数值匹配
      if (key && key.startsWith(":")) {
        result[key.slice(1)] = value;
        continue;
      }
      // 路径与模版不匹配
      if (key !== "*" && key !== value) {
        break;
      }
    }
    return result;
  }

  /**
   * 生成 URI Search 参数
   * @param params
   * @example {} => ""
   * @example { q: "1", w: "2" } => "?q=1&w=2"
   */
  public static stringifyParams(params: O.Map<string | number>): string {
    const init: O.Map<string> = {};
    for (const [key, value] of Object.entries(params)) {
      init[key] = String(value);
    }
    const search = new URLSearchParams(init).toString();
    return search ? "?" + search : "";
  }
}
