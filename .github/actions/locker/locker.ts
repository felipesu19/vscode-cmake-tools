/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GitHub } from '../api/api';
import { daysAgoToHumanReadbleDate } from '../common/utils';
import { ActionBase } from '../common/actionBase';

export class Locker extends ActionBase {
    constructor(
        private github: GitHub,
        private daysSinceClose: number,
        private daysSinceUpdate: number,
        labels?: string,
        milestoneName?: string,
        milestoneId?: string,
        ignoreLabels?: string,
        ignoreMilestoneNames?: string,
        ignoreMilestoneIds?: string,
        minimumVotes?: number,
        maximumVotes?: number
    ) {
        super(labels, milestoneName, milestoneId, ignoreLabels, ignoreMilestoneNames, ignoreMilestoneIds, minimumVotes, maximumVotes);
    }

    async run() {
        const closedTimestamp = daysAgoToHumanReadbleDate(this.daysSinceClose);
        const updatedTimestamp = daysAgoToHumanReadbleDate(this.daysSinceUpdate);

        const query = this.buildQuery((this.daysSinceClose ? `closed:<${closedTimestamp} ` : "") + (this.daysSinceUpdate ? `updated:<${updatedTimestamp} ` : "") + "is:closed is:unlocked");
        let x = await this.github.hasWriteAccess()
        console.log(x)

        const { token } = await appOctokit.auth()

        console.log(token)

        for await (const page of this.github.query({ q: query })) {
            await Promise.all(
                page.map(async (issue) => {
                    const hydrated = await issue.getIssue();

                    if (!hydrated.locked && !hydrated.open && this.validateIssue(hydrated)
                    // TODO: Verify closed and updated timestamps
                    ) {
                        console.log(`Locking issue ${hydrated.number}`);
                        await issue.lockIssue();
                    } else {
                        if (hydrated.locked) {
                            console.log(`Issue ${hydrated.number} is already locked. Ignoring`);
                        } else if (hydrated.open) {
                            console.log(`Issue ${hydrated.number} is open. Ignoring`);
                        }
                    }
                })
            );
        }
    }
}
