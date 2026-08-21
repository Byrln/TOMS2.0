import { processExpiredHolds } from "./jobs";

const expired = processExpiredHolds([], new Date());
process.stdout.write(JSON.stringify({ worker: "toms", status: "ready", expiredHolds: expired.length }));

