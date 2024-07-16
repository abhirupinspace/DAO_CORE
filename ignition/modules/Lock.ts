const JAN_1ST_2030 = 1893456000;
const ONE_GWEI: bigint = 1_000_000_000n;

interface LockModuleParams {
  unlockTime?: number;
  lockedAmount?: bigint;
}

const LockModule = buildModule<LockModuleParams>("LockModule", (m: ModuleBuilderParam<LockModuleParams>) => {
  const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  return { lock };
});

export default LockModule;