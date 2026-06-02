"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorNode = void 0;
class ValidatorNode {
    async invoke(state) {
        try {
            if (!state.manifest) {
                throw new Error('No campaign manifest available from architect node');
            }
            const manifest = state.manifest;
            const errors = [];
            const warnings = [];
            // Run all validation checks
            this.validateManifestStructure(manifest, errors);
            this.validateToolAvailability(manifest, state.activeTools, warnings);
            this.validateGuardrails(manifest, state.intent, errors, warnings);
            this.validateRateLimits(manifest, errors, warnings);
            this.validateDuplicatePrevention(manifest, warnings);
            // If there are errors, don't proceed
            if (errors.length > 0) {
                return {
                    ...state,
                    validatedPlan: undefined,
                    validationErrors: errors,
                    warnings,
                    error: `Validation failed: ${errors.join(', ')}`
                };
            }
            // Apply any automatic fixes based on warnings
            const fixedManifest = this.applyAutoFixes(manifest, warnings);
            return {
                ...state,
                validatedPlan: fixedManifest,
                validationErrors: [],
                warnings,
                error: undefined
            };
        }
        catch (error) {
            console.error('Validator node error:', error);
            return {
                ...state,
                validatedPlan: undefined,
                validationErrors: undefined,
                warnings: undefined,
                error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateManifestStructure(manifest, errors) {
        if (!manifest.steps) {
            errors.push('Campaign manifest is missing steps');
            return;
        }
        // Check for circular dependencies
        const stepIds = new Set(manifest.steps.map(s => s.id));
        for (const step of manifest.steps) {
            for (const dep of step.dependencies) {
                if (!stepIds.has(dep)) {
                    errors.push(`Step ${step.id} depends on non-existent step ${dep}`);
                }
            }
        }
        // Check for cycles in dependencies (simplified check)
        for (const step of manifest.steps) {
            if (step.dependencies.includes(step.id)) {
                errors.push(`Step ${step.id} cannot depend on itself`);
            }
        }
    }
    validateToolAvailability(manifest, activeTools, warnings) {
        const usedTools = [...new Set(manifest.steps.map(s => s.tool))];
        for (const tool of usedTools) {
            if (tool !== 'System' && !activeTools.includes(tool)) {
                warnings.push(`Tool '${tool}' is not active for this client. Available tools: ${activeTools.join(', ')}.`);
            }
        }
    }
    validateGuardrails(manifest, intent, errors, warnings) {
        // Check for zero-delay emails
        const emailSteps = manifest.steps.filter(s => ['Smartlead', 'Instantly', 'Lemlist'].includes(s.tool) &&
            ['send_campaign', 'send_emails'].includes(s.action));
        for (const step of emailSteps) {
            // Check if there's a warmup delay before this step
            const warmupSteps = manifest.steps.filter(s => s.tool === 'System' &&
                s.action === 'wait' &&
                s.order < step.order);
            if (warmupSteps.length === 0) {
                warnings.push(`Email step '${step.id}' has no warmup delay. Consider adding 2-3 day warmup for better deliverability.`);
            }
            else {
                const totalWarmup = warmupSteps.reduce((sum, s) => sum + (s.params.days || 0), 0);
                if (totalWarmup < 2) {
                    warnings.push(`Email step '${step.id}' has only ${totalWarmup} days warmup. Recommended: 2+ days.`);
                }
            }
        }
        // Check volume limits
        if (intent && intent.volume > 1000) {
            warnings.push(`Large volume (${intent.volume}) detected. Consider splitting into smaller campaigns.`);
        }
        // Check for consecutive email sends
        const emailStepOrders = emailSteps.map(s => s.order).sort((a, b) => a - b);
        for (let i = 1; i < emailStepOrders.length; i++) {
            const gap = emailStepOrders[i] - emailStepOrders[i - 1];
            if (gap < 2) {
                warnings.push('Email steps are too close together. Add delays between sends.');
            }
        }
    }
    validateRateLimits(manifest, errors, warnings) {
        // Define rate limits (requests per minute)
        const rateLimits = {
            'Apollo': { 'search_people': 50 },
            'Clay': { 'enrich_contacts': 100 },
            'Smartlead': { 'send_campaign': 20 },
            'HeyReach': { 'send_connection_requests': 30 }
        };
        let totalEstimatedTime = 0;
        for (const step of manifest.steps) {
            if (step.tool === 'System')
                continue;
            const toolLimits = rateLimits[step.tool];
            if (toolLimits && toolLimits[step.action]) {
                const limit = toolLimits[step.action];
                const estimatedRequests = Math.max(1, Math.ceil((manifest.estimated_cost || 100) / 10)); // Rough estimate
                if (estimatedRequests > limit) {
                    const requiredTime = Math.ceil(estimatedRequests / limit);
                    totalEstimatedTime = Math.max(totalEstimatedTime, requiredTime);
                    if (requiredTime > 60) { // More than 1 hour
                        warnings.push(`Step '${step.id}' may take ${requiredTime} minutes due to rate limits.`);
                    }
                }
            }
        }
        // Update manifest duration if rate limits affect timing
        if (totalEstimatedTime > manifest.estimated_duration) {
            manifest.estimated_duration = totalEstimatedTime;
        }
    }
    validateDuplicatePrevention(manifest, warnings) {
        // Check if campaign might create duplicates
        const sourcingSteps = manifest.steps.filter(s => ['Apollo', 'ZoomInfo', 'Cognism'].includes(s.tool) &&
            ['search_people', 'search_companies'].includes(s.action));
        if (sourcingSteps.length > 1) {
            warnings.push('Multiple sourcing steps detected. Ensure deduplication logic is in place.');
        }
        // Check for CRM sync without dedup
        const crmSteps = manifest.steps.filter(s => ['HubSpot', 'Salesforce', 'Pipedrive'].includes(s.tool));
        if (crmSteps.length > 0 && sourcingSteps.length > 0) {
            warnings.push('CRM sync detected. Verify duplicate prevention in CRM integration.');
        }
    }
    applyAutoFixes(manifest, warnings) {
        const fixedManifest = {
            ...manifest,
            steps: [...manifest.steps]
        };
        if (fixedManifest.steps.length === 0) {
            fixedManifest.steps.push({
                id: 'manual_review',
                order: 1,
                tool: 'System',
                action: 'manual_review',
                params: {
                    reason: 'No executable tool steps generated for current active tools',
                    next_action: 'Enable required tools or adjust prompt'
                },
                dependencies: [],
                estimated_time: 5
            });
            fixedManifest.estimated_duration = Math.max(fixedManifest.estimated_duration || 0, 5);
            warnings.push('No executable tool steps were generated. Added System manual_review fallback step.');
            return fixedManifest;
        }
        // Auto-add warmup delays for email steps without them
        const emailStepsWithoutWarmup = fixedManifest.steps.filter(step => {
            if (!['Smartlead', 'Instantly', 'Lemlist'].includes(step.tool))
                return false;
            const hasWarmup = fixedManifest.steps.some(s => s.tool === 'System' &&
                s.action === 'wait' &&
                s.order < step.order);
            return !hasWarmup;
        });
        if (emailStepsWithoutWarmup.length > 0) {
            // Add a 2-day warmup step before the first email step
            const firstEmailStep = emailStepsWithoutWarmup[0];
            const warmupStep = {
                id: 'auto_warmup',
                order: firstEmailStep.order,
                tool: 'System',
                action: 'wait',
                params: {
                    days: 2,
                    reason: 'Auto-added warmup for better deliverability'
                },
                dependencies: firstEmailStep.dependencies,
                estimated_time: 2 * 24 * 60 // 2 days in minutes
            };
            // Shift all subsequent steps
            fixedManifest.steps.forEach(step => {
                if (step.order >= firstEmailStep.order) {
                    step.order += 1;
                }
            });
            // Insert warmup step
            fixedManifest.steps.splice(firstEmailStep.order - 1, 0, warmupStep);
            // Update dependencies
            fixedManifest.steps.forEach(step => {
                if (step.order > warmupStep.order) {
                    step.dependencies = step.dependencies.map(dep => dep === firstEmailStep.id ? warmupStep.id : dep);
                }
            });
            warnings.push('Auto-added 2-day warmup delay before email steps');
            fixedManifest.estimated_duration += warmupStep.estimated_time;
        }
        return fixedManifest;
    }
}
exports.ValidatorNode = ValidatorNode;
