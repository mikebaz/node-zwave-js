import { CommandClasses, validatePayload } from "@zwave-js/core";
import type { ZWaveHost } from "@zwave-js/host";
import type { AllOrNone } from "@zwave-js/shared";
import { CCAPI } from "../lib/API";
import {
	CCCommandOptions,
	CommandClass,
	CommandClassDeserializationOptions,
	gotDeserializationOptions,
} from "../lib/CommandClass";
import {
	API,
	CCCommand,
	ccValues,
	commandClass,
	expectedCCResponse,
	implementedVersion,
} from "../lib/CommandClassDecorators";
import { V } from "../lib/Values";
import {
	ScheduleEntryLockCommand,
	ScheduleEntryLockSetAction,
	ScheduleEntryLockWeekday,
} from "../lib/_Types";

export const ScheduleEntryLockCCValues = Object.freeze({
	...V.defineStaticCCValues(CommandClasses["Schedule Entry Lock"], {
		// Static CC values go here
	}),

	...V.defineDynamicCCValues(CommandClasses["Schedule Entry Lock"], {
		// Dynamic CC values go here
	}),
});

@API(CommandClasses["Schedule Entry Lock"])
export class ScheduleEntryLockCCAPI extends CCAPI {
	// TODO: Implementation
}

// TODO: Move this enumeration into the src/lib/_Types.ts file
// All additional type definitions (except CC constructor options) must be defined there too

@commandClass(CommandClasses["Schedule Entry Lock"])
@implementedVersion(3)
@ccValues(ScheduleEntryLockCCValues)
export class ScheduleEntryLockCC extends CommandClass {
	declare ccCommand: ScheduleEntryLockCommand;
}

interface ScheduleEntryLockCCEnableSetOptions extends CCCommandOptions {
	userId: number;
	enabled: boolean;
}

@CCCommand(ScheduleEntryLockCommand.EnableSet)
export class ScheduleEntryLockCCEnableSet extends ScheduleEntryLockCC {
	public constructor(
		host: ZWaveHost,
		options:
			| CommandClassDeserializationOptions
			| ScheduleEntryLockCCEnableSetOptions,
	) {
		super(host, options);
		if (gotDeserializationOptions(options)) {
			validatePayload(this.payload.length >= 2);
			this.userId = this.payload[0];
			this.enabled = this.payload[1] === 0x01;
		} else {
			this.userId = options.userId;
			this.enabled = options.enabled;
		}
	}

	public userId: number;
	public enabled: boolean;

	public serialize(): Buffer {
		this.payload = Buffer.from([this.userId, this.enabled ? 0x01 : 0x00]);
		return super.serialize();
	}
}

interface ScheduleEntryLockCCEnableAllSetOptions extends CCCommandOptions {
	enabled: boolean;
}

@CCCommand(ScheduleEntryLockCommand.EnableAllSet)
export class ScheduleEntryLockCCEnableAllSet extends ScheduleEntryLockCC {
	public constructor(
		host: ZWaveHost,
		options:
			| CommandClassDeserializationOptions
			| ScheduleEntryLockCCEnableAllSetOptions,
	) {
		super(host, options);
		if (gotDeserializationOptions(options)) {
			validatePayload(this.payload.length >= 1);
			this.enabled = this.payload[0] === 0x01;
		} else {
			this.enabled = options.enabled;
		}
	}

	public enabled: boolean;

	public serialize(): Buffer {
		this.payload = Buffer.from([this.enabled ? 0x01 : 0x00]);
		return super.serialize();
	}
}

interface ScheduleEntryLockCCSupportedReportOptions extends CCCommandOptions {
	numWeekDaySlots: number;
	numYearDaySlots: number;
	numDailyRepeatingSlots?: number;
}

@CCCommand(ScheduleEntryLockCommand.SupportedReport)
export class ScheduleEntryLockCCSupportedReport extends ScheduleEntryLockCC {
	public constructor(
		host: ZWaveHost,
		options:
			| CommandClassDeserializationOptions
			| ScheduleEntryLockCCSupportedReportOptions,
	) {
		super(host, options);
		if (gotDeserializationOptions(options)) {
			validatePayload(this.payload.length >= 2);
			this.numWeekDaySlots = this.payload[0];
			this.numYearDaySlots = this.payload[1];
			if (this.payload.length >= 3) {
				this.numDailyRepeatingSlots = this.payload[2];
			}
		} else {
			this.numWeekDaySlots = options.numWeekDaySlots;
			this.numYearDaySlots = options.numYearDaySlots;
			this.numDailyRepeatingSlots = options.numDailyRepeatingSlots;
		}
	}

	public numWeekDaySlots: number;
	public numYearDaySlots: number;
	public numDailyRepeatingSlots: number | undefined;

	public serialize(): Buffer {
		this.payload = Buffer.from([
			this.numWeekDaySlots,
			this.numYearDaySlots,
		]);
		if (this.version >= 3 && this.numDailyRepeatingSlots != undefined) {
			this.payload = Buffer.concat([
				this.payload,
				Buffer.from([this.numDailyRepeatingSlots]),
			]);
		}
		return super.serialize();
	}
}

@CCCommand(ScheduleEntryLockCommand.SupportedGet)
@expectedCCResponse(ScheduleEntryLockCCSupportedReport)
export class ScheduleEntryLockCCSupportedGet extends ScheduleEntryLockCC {}

/** @publicAPI */
export type ScheduleEntryLockCCWeekDayScheduleSetOptions = {
	userId: number;
	slotId: number;
} & (
	| {
			action: ScheduleEntryLockSetAction.Erase;
	  }
	| {
			action: ScheduleEntryLockSetAction.Set;
			weekday: ScheduleEntryLockWeekday;
			startHour: number;
			startMinute: number;
			stopHour: number;
			stopMinute: number;
	  }
);

@CCCommand(ScheduleEntryLockCommand.WeekDayScheduleSet)
export class ScheduleEntryLockCCWeekDayScheduleSet extends ScheduleEntryLockCC {
	public constructor(
		host: ZWaveHost,
		options:
			| CommandClassDeserializationOptions
			| (CCCommandOptions & ScheduleEntryLockCCWeekDayScheduleSetOptions),
	) {
		super(host, options);
		if (gotDeserializationOptions(options)) {
			validatePayload(this.payload.length >= 3);
			this.action = this.payload[0];
			validatePayload(
				this.action === ScheduleEntryLockSetAction.Set ||
					this.action === ScheduleEntryLockSetAction.Erase,
			);
			this.userId = this.payload[1];
			this.slotId = this.payload[2];
			if (this.action === ScheduleEntryLockSetAction.Set) {
				validatePayload(this.payload.length >= 8);
				this.weekday = this.payload[3];
				this.startHour = this.payload[4];
				this.startMinute = this.payload[5];
				this.stopHour = this.payload[6];
				this.stopMinute = this.payload[7];
			}
		} else {
			this.userId = options.userId;
			this.slotId = options.slotId;
			this.action = options.action;
			if (options.action === ScheduleEntryLockSetAction.Set) {
				this.weekday = options.weekday;
				this.startHour = options.startHour;
				this.startMinute = options.startMinute;
				this.stopHour = options.stopHour;
				this.stopMinute = options.stopMinute;
			}
		}
	}

	public userId: number;
	public slotId: number;

	public action: ScheduleEntryLockSetAction;

	public weekday?: ScheduleEntryLockWeekday;
	public startHour?: number;
	public startMinute?: number;
	public stopHour?: number;
	public stopMinute?: number;

	public serialize(): Buffer {
		this.payload = Buffer.from([
			this.action,
			this.userId,
			this.slotId,
			// The report should have these fields set to 0xff
			// if the slot is erased. The specs don't mention anything
			// for the Set command, so we just assume the same is okay
			this.weekday ?? 0xff,
			this.startHour ?? 0xff,
			this.startMinute ?? 0xff,
			this.stopHour ?? 0xff,
			this.stopMinute ?? 0xff,
		]);
		return super.serialize();
	}
}

type ScheduleEntryLockCCWeekDayScheduleReportOptions = {
	userId: number;
	slotId: number;
} & AllOrNone<{
	weekday: ScheduleEntryLockWeekday;
	startHour: number;
	startMinute: number;
	stopHour: number;
	stopMinute: number;
}>;

@CCCommand(ScheduleEntryLockCommand.WeekDayScheduleReport)
export class ScheduleEntryLockCCWeekDayScheduleReport extends ScheduleEntryLockCC {
	public constructor(
		host: ZWaveHost,
		options:
			| CommandClassDeserializationOptions
			| (CCCommandOptions &
					ScheduleEntryLockCCWeekDayScheduleReportOptions),
	) {
		super(host, options);
		if (gotDeserializationOptions(options)) {
			validatePayload(this.payload.length >= 2);
			this.userId = this.payload[0];
			this.slotId = this.payload[1];
			if (this.payload.length >= 7) {
				if (this.payload[2] !== 0xff) {
					this.weekday = this.payload[2];
				}
				if (this.payload[3] !== 0xff) {
					this.startHour = this.payload[3];
				}
				if (this.payload[4] !== 0xff) {
					this.startMinute = this.payload[4];
				}
				if (this.payload[5] !== 0xff) {
					this.stopHour = this.payload[5];
				}
				if (this.payload[6] !== 0xff) {
					this.stopMinute = this.payload[6];
				}
			}
		} else {
			this.userId = options.userId;
			this.slotId = options.slotId;
			this.weekday = options.weekday;
			this.startHour = options.startHour;
			this.startMinute = options.startMinute;
			this.stopHour = options.stopHour;
			this.stopMinute = options.stopMinute;
		}
	}

	public userId: number;
	public slotId: number;
	public weekday?: ScheduleEntryLockWeekday;
	public startHour?: number;
	public startMinute?: number;
	public stopHour?: number;
	public stopMinute?: number;

	public serialize(): Buffer {
		this.payload = Buffer.from([
			this.userId,
			this.slotId,
			this.weekday ?? 0xff,
			this.startHour ?? 0xff,
			this.startMinute ?? 0xff,
			this.stopHour ?? 0xff,
			this.stopMinute ?? 0xff,
		]);
		return super.serialize();
	}
}

interface ScheduleEntryLockCCWeekDayScheduleGetOptions
	extends CCCommandOptions {
	userId: number;
	slotId: number;
}

@CCCommand(ScheduleEntryLockCommand.WeekDayScheduleGet)
@expectedCCResponse(ScheduleEntryLockCCWeekDayScheduleReport)
export class ScheduleEntryLockCCWeekDayScheduleGet extends ScheduleEntryLockCC {
	public constructor(
		host: ZWaveHost,
		options:
			| CommandClassDeserializationOptions
			| ScheduleEntryLockCCWeekDayScheduleGetOptions,
	) {
		super(host, options);
		if (gotDeserializationOptions(options)) {
			validatePayload(this.payload.length >= 2);
			this.userId = this.payload[0];
			this.slotId = this.payload[1];
		} else {
			this.userId = options.userId;
			this.slotId = options.slotId;
		}
	}

	public userId: number;
	public slotId: number;

	public serialize(): Buffer {
		this.payload = Buffer.from([this.userId, this.slotId]);
		return super.serialize();
	}
}

// YearDayScheduleSet = 0x06,
// YearDayScheduleGet = 0x07,
// YearDayScheduleReport = 0x08,

// TimeOffsetGet = 0x0b,
// TimeOffsetReport = 0x0c,
// TimeOffsetSet = 0x0d,

// DailyRepeatingGet = 0x0e,
// DailyRepeatingReport = 0x0f,
// DailyRepeatingSet = 0x10,
