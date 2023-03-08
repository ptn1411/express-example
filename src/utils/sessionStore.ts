import { Store, SessionData } from "express-session";
import ormjson from "ormjson";
interface TypeDBStore {
  _id: string;
  sid: string;
  session: SessionData;
}
const SessionStore = () => {
  class DBStore extends Store {
    filePath: string;
    db: ormjson<TypeDBStore>;
    constructor(filePath: string, options = {}) {
      super(options);
      this.filePath = filePath;
      this.db = new ormjson<TypeDBStore>(filePath);
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
      callback("", obj?.session);
    }
    set(
      sid: string,
      session: SessionData,
      callback?: (err?: any) => void
    ): void {
      const obj = this.db.findOne({
        where: {
          sid,
        },
      });
      if (obj?.sid) {
        obj.session = session;
        obj.save();
        callback;
      }
      this.db.create({
        sid,
        session,
      });
      callback;
    }
    all?(
      callback: (
        err: any,
        obj?: SessionData[] | { [sid: string]: SessionData } | null
      ) => void
    ): void {
      const data = this.db.findAll();
      callback(true, data);
    }
    length?(callback: (err: any, length?: number) => void): void {
      const data = this.db.findAll();
      callback(true, data.length);
    }
    destroy(sid: string, callback?: (err?: any) => void): void {
      const obj = this.db.findOne({
        where: {
          sid,
        },
      });
      obj?.destroy();
      callback;
    }
    clear?(callback?: (err?: any) => void): void {
      const data = this.db.findAll();
      data?.forEach((value: TypeDBStore) => {
        this.db.delete(value._id);
      });
      callback;
    }
    touch?(sid: string, session: SessionData, callback?: () => void): void {
      this.db.create({
        session,
        sid,
      });
      callback;
    }
  }

  return DBStore;
};
export default SessionStore;
