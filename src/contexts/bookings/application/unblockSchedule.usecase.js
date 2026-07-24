// RF07 — liberar un bloqueo por mantenimiento antes de tiempo.
export function makeUnblockSchedule(deps) {
    return function unblockSchedule(blockId) {
        return deps.scheduleBlocks.deleteById(blockId);
    };
}
//# sourceMappingURL=unblockSchedule.usecase.js.map