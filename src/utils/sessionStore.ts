import { Store, SessionData } from "express-session";
import ormjson from "ormjson";
// import jsonPtn from "@ptndev/json";
// type TypeSession = SessionData & { userId?: number };
interface TypeDBStore {
  _id: string;
  sid: string;
  data: SessionData;
}

class SessionStore extends Store {
  filePath: string;
  db: ormjson<TypeDBStore>;
  constructor(filePath: string, options = {}) {
    super(options);
    this.filePath = filePath;
    this.db = new ormjson<TypeDBStore>(filePath, {
      lengthId: 32,
    });
  }

  get(
    sid: string,
    callback: (err: any, session?: SessionData | null) => void
  ): void {
    const obj = this.db.findOne({
      where: {
        sid,
      },
    });

    const date = obj?.data.cookie.expires as unknown as string;
    if (obj?.data.cookie.expires) {
      obj.data.cookie.expires = new Date(date);
    }

    return callback(null, obj?.data);
  }
  set(sid: string, session: SessionData, callback: (err: any) => void): void {
    const obj = this.db.findOne({
      where: {
        sid,
      },
    });

    if (obj?.sid === sid) {
      this.db.update(obj?._id, session);
      return callback(null);
    }

    this.db.create({
      sid,
      data: session,
    });
    return callback(null);
  }
  all?(
    callback: (
      err: any,
      obj?: SessionData[] | { [sid: string]: SessionData } | null
    ) => void
  ): void {
    const data = this.db.findAll();

    return callback(null, data);
  }
  length?(callback: (err: any, length?: number) => void): void {
    const data = this.db.findAll();
    return callback(null, data.length);
  }
  destroy(sid: string, callback: (err: any) => void): void {
    const obj = this.db.findOne({
      where: {
        sid,
      },
    });
    obj?.destroy();
    return callback(null);
  }
  clear?(callback: (err: any) => void): void {
    const data = this.db.findAll();
    data?.forEach((value: TypeDBStore) => {
      this.db.delete(value._id);
    });
    return callback(null);
  }
  touch(sid: string, session: SessionData, callback?: () => void): void {
    this.db.create({
      data: session,
      sid,
    });
    callback;
  }
}
export default SessionStore;
