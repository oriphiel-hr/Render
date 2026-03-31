import { z } from 'zod';

export const partnerInquiryCreateSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(180),
  companyName: z.string().max(180).optional().or(z.literal('')),
  phone: z.string().max(60).optional().or(z.literal('')),
  serviceType: z.enum(['WEB', 'MARKETING', 'AUTOMATION', 'OTHER']),
  message: z.string().min(10).max(4000),
  source: z.enum(['USLUGAR_REFERRAL', 'ORIPHIEL_DIRECT', 'OTHER']).default('OTHER'),
  website: z.string().max(10).optional(),
  strategySnapshot: z
    .object({
      industry: z.string().max(120),
      goal: z.string().max(60),
      paymentModel: z.string().max(60),
      recommendation: z.object({
        channels: z.array(z.string().max(200)).max(20),
        setup: z.array(z.string().max(200)).max(20),
        expectations: z.array(z.string().max(200)).max(20)
      }),
      offerSnapshot: z
        .object({
          demoVersion: z.string().max(20),
          industry: z.string().max(120),
          goalFocus: z.string().max(80),
          clientProfile: z.enum(['UNSURE', 'DEMANDING']),
          riskTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']),
          selectedScenarioId: z.string().max(80).nullable().optional(),
          needs: z.array(z.string().max(80)).max(20),
          recommendedTrack: z.enum(['STARTER', 'GROWTH', 'PREMIUM']),
          phases: z.array(
            z.object({
              id: z.string().max(40),
              title: z.string().max(120)
            })
          ),
          predictedQA: z.array(
            z.object({
              q: z.string().max(300),
              a: z.string().max(600)
            })
          ),
          technologySnapshot: z.object({
            selectedTechnologies: z.array(
              z.object({
                id: z.string().max(60),
                name: z.string().max(120),
                category: z.string().max(120),
                sourceUrl: z.string().url().max(500),
                pricingModel: z.string().max(120)
              })
            ),
            assumptions: z.array(z.string().max(300)).max(20),
            costEstimate: z.object({
              setupEur: z.number().int().nonnegative(),
              monthlyOpsEur: z.number().int().nonnegative(),
              toolingEur: z.number().int().nonnegative(),
              totalMonthlyEur: z.number().int().nonnegative()
            })
          })
        })
        .nullable()
        .optional()
    })
    .optional()
});

export const demoConfigurationCreateSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(180),
  companyName: z.string().max(180).optional().or(z.literal('')),
  phone: z.string().max(60).optional().or(z.literal('')),
  message: z.string().min(10).max(4000),
  source: z.enum(['USLUGAR_REFERRAL', 'ORIPHIEL_DIRECT', 'OTHER']).default('OTHER'),
  website: z.string().max(10).optional(),
  strategySnapshot: z.object({
    offerSnapshot: z.object({
      demoVersion: z.string().max(20),
      industry: z.string().max(120),
      goalFocus: z.string().max(80),
      clientProfile: z.enum(['UNSURE', 'DEMANDING']),
      riskTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      selectedScenarioId: z.string().max(80).nullable().optional(),
      needs: z.array(z.string().max(80)).max(20),
      recommendedTrack: z.enum(['STARTER', 'GROWTH', 'PREMIUM']),
      phases: z.array(
        z.object({
          id: z.string().max(40),
          title: z.string().max(120)
        })
      ),
      predictedQA: z.array(
        z.object({
          q: z.string().max(300),
          a: z.string().max(600)
        })
      ),
      technologySnapshot: z.object({
        selectedTechnologies: z.array(
          z.object({
            id: z.string().max(60),
            name: z.string().max(120),
            category: z.string().max(120),
            sourceUrl: z.string().url().max(500),
            pricingModel: z.string().max(120)
          })
        ),
        assumptions: z.array(z.string().max(300)).max(20),
        costEstimate: z.object({
          setupEur: z.number().int().nonnegative(),
          monthlyOpsEur: z.number().int().nonnegative(),
          toolingEur: z.number().int().nonnegative(),
          totalMonthlyEur: z.number().int().nonnegative()
        })
      })
    })
  })
});

export const partnerInquiryAdminUpdateSchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'OFFER_SENT', 'WON', 'LOST']).optional(),
  assignedTo: z.string().max(120).optional(),
  nextActionAt: z.string().datetime().optional(),
  notes: z.string().max(4000).optional()
});

export const clientCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  companyName: z.string().max(180).optional().or(z.literal('')),
  phone: z.string().max(60).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal(''))
});

export const clientConfigurationCreateSchema = z.object({
  title: z.string().min(2).max(200),
  status: z.string().max(40).optional(),
  sourceInquiryId: z.string().max(80).optional(),
  strategySnapshot: z.any(),
  pricingSnapshot: z.any().optional(),
  createdBy: z.string().max(120).optional()
});

export const clientConfigurationUpdateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  status: z.string().max(40).optional(),
  strategySnapshot: z.any().optional(),
  pricingSnapshot: z.any().optional(),
  createdBy: z.string().max(120).optional()
});
