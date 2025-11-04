🔄 **Remaining UI Tasks**:



&nbsp; Switch Capital Partners to Modal Flow



&nbsp; This involves:

&nbsp; 1. Create CapitalPartnerForm component - Reusable form for

&nbsp; creating/editing capital partners

&nbsp; 2. Create ContactForm component - Reusable form for creating/editing

&nbsp; contacts

&nbsp; 3. Update CapitalPartnersList.tsx - Replace Link navigation with modal

&nbsp;  popups (matching Sponsors/Counsel pattern) 





I'll create the modal flows for Capital Partners. Let me start by

&nbsp; examining how the Sponsors module implements their modal flow to

&nbsp; maintain consistency.



● Read(frontend\\src\\pages\\sponsors\\CorporatesList.tsx)

&nbsp; ⎿  Read 100 lines



● Read(frontend\\src\\components\\features\\sponsors\\CorporateForm.tsx)

&nbsp; ⎿  Read 342 lines



● Read(frontend\\src\\components\\features\\sponsors\\SponsorContactForm.tsx)

&nbsp; ⎿  Read 272 lines



● Read(frontend\\src\\types\\liquidity.ts)

&nbsp; ⎿  Read 347 lines



● Search(pattern: "\*\*/InvestmentPreferencesGrid.tsx")

&nbsp; ⎿  Found 0 files



● Search(pattern: "\*\*/capital-partners/\*.tsx")

&nbsp; ⎿  Found 14 files (ctrl+o to expand)



● Read(frontend\\src\\components\\features\\capital-partners\\CapitalPartnerForm.

&nbsp;     tsx)

&nbsp; ⎿  Read 259 lines



● Read(frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx)

&nbsp; ⎿  Read 318 lines



● Read(frontend\\src\\components\\features\\capital-partners\\PreferencesGrid.tsx

&nbsp;     )

&nbsp; ⎿  Read 100 lines



● Now I'll update the CapitalPartnerForm to include investment

&nbsp; preferences and investment ranges:



● Update(frontend\\src\\components\\features\\capital-partners\\CapitalPartnerFor

&nbsp;       m.tsx)

&nbsp; ⎿  Updated frontend\\src\\components\\features\\capital-partners\\CapitalP

&nbsp;    rtnerForm.tsx with 2 additions

&nbsp;       8      CapitalPartner,

&nbsp;       9      CapitalPartnerFormData,

&nbsp;      10      DealPrecedent,

&nbsp;      11 +    InvestmentPreferences,

&nbsp;      12      ORGANIZATION\_TYPES,

&nbsp;      13      RELATIONSHIP\_LEVELS

&nbsp;      14    } from '../../../types/liquidity';

&nbsp;      15    import DealPrecedentsEditor from

&nbsp;           '../../shared/DealPrecedentsEditor';

&nbsp;      16 +  import PreferencesGrid from './PreferencesGrid';

&nbsp;      17

&nbsp;      18    interface CapitalPartnerFormProps {

&nbsp;      19      initialData?: CapitalPartner | null;



● Update(frontend\\src\\components\\features\\capital-partners\\CapitalPartnerFor

&nbsp;       m.tsx)

&nbsp; ⎿  Updated frontend\\src\\components\\features\\capital-partners\\CapitalP

&nbsp;    rtnerForm.tsx with 28 additions and 1 removal

&nbsp;      31        type: initialData?.type || '',

&nbsp;      32        country: initialData?.country || '',

&nbsp;      33        headquarters\_location:

&nbsp;           initialData?.headquarters\_location || '',

&nbsp;      34 +      investment\_min: initialData?.investment\_min || 0,

&nbsp;      35 +      investment\_max: initialData?.investment\_max || 0,

&nbsp;      36 +      currency: initialData?.currency || 'USD',

&nbsp;      37        relationship: initialData?.relationship ||

&nbsp;           'Developing',

&nbsp;      38        notes: initialData?.notes || '',

&nbsp;      39        company\_description:

&nbsp;           initialData?.company\_description || '',

&nbsp;      40 -      deal\_precedents: initialData?.deal\_precedents || \[]

&nbsp;      40 +      deal\_precedents: initialData?.deal\_precedents || \[],

&nbsp;      41 +      preferences: initialData?.preferences || {

&nbsp;      42 +        investment\_grade: 'N',

&nbsp;      43 +        high\_yield: 'N',

&nbsp;      44 +        infra\_debt: 'N',

&nbsp;      45 +        senior\_secured: 'N',

&nbsp;      46 +        subordinated: 'N',

&nbsp;      47 +        bonds: 'N',

&nbsp;      48 +        loan\_agreement: 'N',

&nbsp;      49 +        quasi\_sovereign\_only: 'N',

&nbsp;      50 +        public\_bond\_high\_yield: 'N',

&nbsp;      51 +        us\_market: 'N',

&nbsp;      52 +        emerging\_markets: 'N',

&nbsp;      53 +        asia\_em: 'N',

&nbsp;      54 +        africa\_em: 'N',

&nbsp;      55 +        emea\_em: 'N',

&nbsp;      56 +        vietnam: 'N',

&nbsp;      57 +        mongolia: 'N',

&nbsp;      58 +        turkey: 'N',

&nbsp;      59 +        coal: 'N',

&nbsp;      60 +        energy\_infra: 'N',

&nbsp;      61 +        transport\_infra: 'N',

&nbsp;      62 +        more\_expensive\_than\_usual: 'N',

&nbsp;      63 +        require\_bank\_guarantee: 'N'

&nbsp;      64 +      }

&nbsp;      65      });

&nbsp;      66

&nbsp;      67      const \[errors, setErrors] = useState<Record<string,

&nbsp;           string>>({});



● Update(frontend\\src\\components\\features\\capital-partners\\CapitalPartnerFor

&nbsp;       m.tsx)

&nbsp; ⎿  Updated frontend\\src\\components\\features\\capital-partners\\CapitalP

&nbsp;    rtnerForm.tsx with 15 additions

&nbsp;       85        }

&nbsp;       86      };

&nbsp;       87

&nbsp;       88 +    const handleNumberChange = (e:

&nbsp;          + React.ChangeEvent<HTMLInputElement>) => {

&nbsp;       89 +      const { name, value } = e.target;

&nbsp;       90 +      setFormData((prev) => ({

&nbsp;       91 +        ...prev,

&nbsp;       92 +        \[name]: value === '' ? 0 : Number(value)

&nbsp;       93 +      }));

&nbsp;       94 +    };

&nbsp;       95 +

&nbsp;       96 +    const handlePreferencesChange = (preferences:

&nbsp;          + Partial<InvestmentPreferences>) => {

&nbsp;       97 +      setFormData((prev) => ({

&nbsp;       98 +        ...prev,

&nbsp;       99 +        preferences

&nbsp;      100 +      }));

&nbsp;      101 +    };

&nbsp;      102 +

&nbsp;      103      const handleDealPrecedentsChange = (deals:

&nbsp;            DealPrecedent\[]) => {

&nbsp;      104        setFormData((prev) => ({

&nbsp;      105          ...prev,



● Update(frontend\\src\\components\\features\\capital-partners\\CapitalPartnerFor

&nbsp;       m.tsx)

&nbsp; ⎿  Updated frontend\\src\\components\\features\\capital-partners\\CapitalP

&nbsp;    rtnerForm.tsx with 63 additions

&nbsp;      238            </select>

&nbsp;      239          </div>

&nbsp;      240

&nbsp;      241 +        {/\* Investment Range \*/}

&nbsp;      242 +        <div className="grid grid-cols-1 md:grid-cols-3

&nbsp;          + gap-4">

&nbsp;      243 +          <div>

&nbsp;      244 +            <label htmlFor="investment\_min"

&nbsp;          + className="block text-sm font-medium text-gray-700

&nbsp;          + mb-1">

&nbsp;      245 +              Investment Capacity (Min)

&nbsp;      246 +            </label>

&nbsp;      247 +            <input

&nbsp;      248 +              type="number"

&nbsp;      249 +              id="investment\_min"

&nbsp;      250 +              name="investment\_min"

&nbsp;      251 +              value={formData.investment\_min || ''}

&nbsp;      252 +              onChange={handleNumberChange}

&nbsp;      253 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      254 +              placeholder="0"

&nbsp;      255 +              min="0"

&nbsp;      256 +            />

&nbsp;      257 +            <p className="mt-1 text-xs text-gray-500">In

&nbsp;          + USD millions</p>

&nbsp;      258 +          </div>

&nbsp;      259 +

&nbsp;      260 +          <div>

&nbsp;      261 +            <label htmlFor="investment\_max"

&nbsp;          + className="block text-sm font-medium text-gray-700

&nbsp;          + mb-1">

&nbsp;      262 +              Investment Capacity (Max)

&nbsp;      263 +            </label>

&nbsp;      264 +            <input

&nbsp;      265 +              type="number"

&nbsp;      266 +              id="investment\_max"

&nbsp;      267 +              name="investment\_max"

&nbsp;      268 +              value={formData.investment\_max || ''}

&nbsp;      269 +              onChange={handleNumberChange}

&nbsp;      270 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      271 +              placeholder="0"

&nbsp;      272 +              min="0"

&nbsp;      273 +            />

&nbsp;      274 +            <p className="mt-1 text-xs text-gray-500">In

&nbsp;          + USD millions</p>

&nbsp;      275 +          </div>

&nbsp;      276 +

&nbsp;      277 +          <div>

&nbsp;      278 +            <label htmlFor="currency" className="block

&nbsp;          + text-sm font-medium text-gray-700 mb-1">

&nbsp;      279 +              Currency

&nbsp;      280 +            </label>

&nbsp;      281 +            <input

&nbsp;      282 +              type="text"

&nbsp;      283 +              id="currency"

&nbsp;      284 +              name="currency"

&nbsp;      285 +              value={formData.currency}

&nbsp;      286 +              onChange={handleChange}

&nbsp;      287 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      288 +              placeholder="USD"

&nbsp;      289 +            />

&nbsp;      290 +          </div>

&nbsp;      291 +        </div>

&nbsp;      292 +

&nbsp;      293 +        {/\* Investment Preferences \*/}

&nbsp;      294 +        <div>

&nbsp;      295 +          <h3 className="text-lg font-semibold

&nbsp;          + text-gray-900 mb-3">Investment Preferences</h3>

&nbsp;      296 +          <PreferencesGrid

&nbsp;      297 +            preferences={formData.preferences || {}}

&nbsp;      298 +            onChange={handlePreferencesChange}

&nbsp;      299 +            readonly={false}

&nbsp;      300 +            collapsible={true}

&nbsp;      301 +          />

&nbsp;      302 +        </div>

&nbsp;      303 +

&nbsp;      304          {/\* Notes \*/}

&nbsp;      305          <div>

&nbsp;      306            <label htmlFor="notes" className="block text-sm

&nbsp;             font-medium text-gray-700 mb-1">



● BashOutput(Reading shell output)

&nbsp; ⎿  > markets-dashboard@0.0.0 dev

&nbsp;    > vite

&nbsp;    … +10 lines (ctrl+o to expand)



● Update(frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx)

&nbsp; ⎿  Updated

&nbsp;    frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx

&nbsp;    with 3 additions and 5 removals

&nbsp;       4     \* Now links directly to capital partner with optional

&nbsp;           team\_name text field

&nbsp;       5     \*/

&nbsp;       6

&nbsp;       7 -  import React, { useState, useEffect } from 'react';

&nbsp;       8 -  import { API\_BASE\_URL } from '../../../config';

&nbsp;       7 +  import React, { useState } from 'react';

&nbsp;       8    import {

&nbsp;       9      Contact,

&nbsp;      10      ContactFormData,

&nbsp;      11 -    CapitalPartner,

&nbsp;      12 -    ApiResponse,

&nbsp;      11      RELATIONSHIP\_LEVELS,

&nbsp;      12      DISC\_PROFILES

&nbsp;      13    } from '../../../types/liquidity';

&nbsp;      14

&nbsp;      15    interface ContactFormProps {

&nbsp;      16      initialData?: Contact | null;

&nbsp;      17 -    preselectedPartnerId?: string;

&nbsp;      17 +    capitalPartnerId: string;

&nbsp;      18 +    capitalPartnerName?: string;

&nbsp;      19      onSave: (data: ContactFormData) => void;

&nbsp;      20      onCancel: () => void;

&nbsp;      21    }



● Update(frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx)

&nbsp; ⎿  Updated

&nbsp;    frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx

&nbsp;    with 3 additions and 24 removals

&nbsp;      22

&nbsp;      23    const ContactForm: React.FC<ContactFormProps> = ({

&nbsp;      24      initialData,

&nbsp;      25 -    preselectedPartnerId,

&nbsp;      25 +    capitalPartnerId,

&nbsp;      26 +    capitalPartnerName,

&nbsp;      27      onSave,

&nbsp;      28      onCancel

&nbsp;      29    }) => {

&nbsp;      30 -    const \[partners, setPartners] =

&nbsp;         - useState<CapitalPartner\[]>(\[]);

&nbsp;      31 -    const \[loadingData, setLoadingData] = useState(true);

&nbsp;      32 -

&nbsp;      30      const \[formData, setFormData] =

&nbsp;           useState<ContactFormData>({

&nbsp;      31 -      capital\_partner\_id: initialData?.capital\_partner\_id

&nbsp;         - || preselectedPartnerId || '',

&nbsp;      31 +      capital\_partner\_id: capitalPartnerId,

&nbsp;      32        team\_name: initialData?.team\_name || '',

&nbsp;      33        name: initialData?.name || '',

&nbsp;      34        role: initialData?.role || '',

&nbsp;    ...

&nbsp;      44

&nbsp;      45      const \[errors, setErrors] = useState<Record<string,

&nbsp;           string>>({});

&nbsp;      46

&nbsp;      47 -    useEffect(() => {

&nbsp;      48 -      fetchPartners();

&nbsp;      49 -    }, \[]);

&nbsp;      50 -

&nbsp;      51 -    const fetchPartners = async () => {

&nbsp;      52 -      try {

&nbsp;      53 -        const response = await

&nbsp;         - fetch(`${API\_BASE\_URL}/api/capital-partners`);

&nbsp;      54 -        const result: ApiResponse<CapitalPartner\[]> =

&nbsp;         - await response.json();

&nbsp;      55 -

&nbsp;      56 -        if (result.success) {

&nbsp;      57 -          setPartners(result.data!);

&nbsp;      58 -        }

&nbsp;      59 -      } catch (err) {

&nbsp;      60 -        console.error('Failed to load capital partners:',

&nbsp;         - err);

&nbsp;      61 -      } finally {

&nbsp;      62 -        setLoadingData(false);

&nbsp;      63 -      }

&nbsp;      64 -    };

&nbsp;      65 -

&nbsp;      47      const handleChange = (

&nbsp;      48        e: React.ChangeEvent<HTMLInputElement |

&nbsp;           HTMLSelectElement | HTMLTextAreaElement>

&nbsp;      49      ) => {



● Update(frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx)

&nbsp; ⎿  Updated

&nbsp;    frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx

&nbsp;    with 8 additions and 34 removals

&nbsp;       95      };

&nbsp;       96

&nbsp;       97      return (

&nbsp;       98 -      <form onSubmit={handleSubmit} className="space-y-6

&nbsp;          -   bg-white p-6 rounded-lg shadow-sm border

&nbsp;          -  border-gray-200">

&nbsp;       99 -        <h2 className="text-xl font-semibold

&nbsp;          - text-gray-900">

&nbsp;      100 -          {initialData ? 'Edit Contact' : 'New Contact'}

&nbsp;      101 -        </h2>

&nbsp;       98 +      <form onSubmit={handleSubmit} className="space-y-6

&nbsp;          +  ">

&nbsp;       99 +        {/\* Capital Partner Info Display \*/}

&nbsp;      100 +        {capitalPartnerName \&\& (

&nbsp;      101 +          <div className="bg-blue-50 border

&nbsp;          + border-blue-200 rounded-lg p-4">

&nbsp;      102 +            <p className="text-sm font-medium

&nbsp;          + text-blue-800">Capital Partner</p>

&nbsp;      103 +            <p className="text-lg font-bold

&nbsp;          + text-blue-900">{capitalPartnerName}</p>

&nbsp;      104 +          </div>

&nbsp;      105 +        )}

&nbsp;      106

&nbsp;      107 -        {loadingData ? (

&nbsp;      108 -          <div className="text-center

&nbsp;          - py-4">Loading...</div>

&nbsp;      109 -        ) : (

&nbsp;      110 -          <>

&nbsp;      111 -            {/\* Capital Partner Selection \*/}

&nbsp;      112 -            <div>

&nbsp;      113 -              <label className="block text-sm font-medium

&nbsp;          -  text-gray-700 mb-1">

&nbsp;      114 -                Capital Partner <span

&nbsp;          - className="text-red-500">\*</span>

&nbsp;      115 -              </label>

&nbsp;      116 -              <select

&nbsp;      117 -                name="capital\_partner\_id"

&nbsp;      118 -                value={formData.capital\_partner\_id}

&nbsp;      119 -                onChange={handleChange}

&nbsp;      120 -                className={`w-full px-3 py-2 border ${

&nbsp;      121 -                  errors.capital\_partner\_id ?

&nbsp;          - 'border-red-500' : 'border-gray-300'

&nbsp;      122 -                } rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500`}

&nbsp;      123 -                disabled={!!preselectedPartnerId}

&nbsp;      124 -              >

&nbsp;      125 -                <option value="">Select Capital

&nbsp;          - Partner</option>

&nbsp;      126 -                {partners.map((partner) => (

&nbsp;      127 -                  <option key={partner.id}

&nbsp;          - value={partner.id}>

&nbsp;      128 -                    {partner.name}

&nbsp;      129 -                  </option>

&nbsp;      130 -                ))}

&nbsp;      131 -              </select>

&nbsp;      132 -              {errors.capital\_partner\_id \&\& (

&nbsp;      133 -                <p className="text-red-500 text-sm

&nbsp;          - mt-1">{errors.capital\_partner\_id}</p>

&nbsp;      134 -              )}

&nbsp;      135 -            </div>

&nbsp;      136 -

&nbsp;      107              {/\* Team Name (Text Field) \*/}

&nbsp;      108              <div>

&nbsp;      109                <label className="block text-sm font-medium

&nbsp;             text-gray-700 mb-1">



● Update(frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx)

&nbsp; ⎿  Updated

&nbsp;    frontend\\src\\components\\features\\capital-partners\\ContactForm.tsx

&nbsp;    with 174 additions and 148 removals

&nbsp;      104            </div>

&nbsp;      105          )}

&nbsp;      106

&nbsp;      107 -            {/\* Team Name (Text Field) \*/}

&nbsp;      108 -            <div>

&nbsp;      109 -

&nbsp;          -  <label className="block text-sm font-medium

&nbsp;          -  text-gray-700 mb-1">

&nbsp;      110 -                Team Name

&nbsp;      111 -              </label>

&nbsp;      112 -              <input

&nbsp;      113 -                type="text"

&nbsp;      114 -                name="team\_name"

&nbsp;      115 -                value={formData.team\_name}

&nbsp;      116 -                onChange={handleChange}

&nbsp;      117 -

&nbsp;          -  placeholder="e.g., Infrastructure Team, Asia Desk..."

&nbsp;      118 -

&nbsp;          -  className="w-full px-3 py-2 border border-gray-300

&nbsp;          -  rounded-md focus:outline-none focus:ring-2

&nbsp;          -  focus:ring-blue-500"

&nbsp;      119 -              />

&nbsp;      120 -              <p className="text-xs text-gray-500 mt-1">

&nbsp;      121 -

&nbsp;          -  Optional - specify which team this contact belongs to

&nbsp;      122 -              </p>

&nbsp;      123 -            </div>

&nbsp;      107 +        {/\* Team Name (Text Field) \*/}

&nbsp;      108 +        <div>

&nbsp;      109 +          <label className="block text-sm font-medium

&nbsp;          +  text-gray-700 mb-1">

&nbsp;      110 +            Team Name

&nbsp;      111 +          </label>

&nbsp;      112 +          <input

&nbsp;      113 +            type="text"

&nbsp;      114 +            name="team\_name"

&nbsp;      115 +            value={formData.team\_name}

&nbsp;      116 +            onChange={handleChange}

&nbsp;      117 +

&nbsp;          +  placeholder="e.g., Infrastructure Team, Asia Desk..."

&nbsp;      118 +

&nbsp;          +  className="w-full px-3 py-2 border border-gray-300

&nbsp;          +  rounded-md focus:outline-none focus:ring-2

&nbsp;          +  focus:ring-blue-500"

&nbsp;      119 +          />

&nbsp;      120 +          <p className="text-xs text-gray-500 mt-1">

&nbsp;      121 +

&nbsp;          +  Optional - specify which team this contact belongs to

&nbsp;      122 +          </p>

&nbsp;      123 +        </div>

&nbsp;      124

&nbsp;      125 -            {/\* Name \*/}

&nbsp;      126 -            <div>

&nbsp;      127 -              <label className="block text-sm font-medium

&nbsp;          -  text-gray-700 mb-1">

&nbsp;      128 -                Contact Name <span

&nbsp;          - className="text-red-500">\*</span>

&nbsp;      129 -              </label>

&nbsp;      130 -              <input

&nbsp;      131 -                type="text"

&nbsp;      132 -                name="name"

&nbsp;      133 -                value={formData.name}

&nbsp;      134 -                onChange={handleChange}

&nbsp;      135 -                className={`w-full px-3 py-2 border ${

&nbsp;      136 -                  errors.name ? 'border-red-500' :

&nbsp;          - 'border-gray-300'

&nbsp;      137 -                } rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500`}

&nbsp;      138 -              />

&nbsp;      139 -              {errors.name \&\& <p className="text-red-500

&nbsp;          - text-sm mt-1">{errors.name}</p>}

&nbsp;      140 -            </div>

&nbsp;      125 +        {/\* Personal Information \*/}

&nbsp;      126 +        <div className="grid grid-cols-1 md:grid-cols-2

&nbsp;          + gap-4">

&nbsp;      127 +          {/\* Name \*/}

&nbsp;      128 +          <div>

&nbsp;      129 +            <label htmlFor="name" className="block

&nbsp;          + text-sm font-medium text-gray-700 mb-1">

&nbsp;      130 +              Name <span

&nbsp;          + className="text-red-600">\*</span>

&nbsp;      131 +            </label>

&nbsp;      132 +            <input

&nbsp;      133 +              type="text"

&nbsp;      134 +              id="name"

&nbsp;      135 +              name="name"

&nbsp;      136 +              value={formData.name}

&nbsp;      137 +              onChange={handleChange}

&nbsp;      138 +              className={`w-full px-3 py-2 border

&nbsp;          + rounded-md focus:outline-none focus:ring-2

&nbsp;          + focus:ring-blue-500 ${

&nbsp;      139 +                errors.name ? 'border-red-500' :

&nbsp;          + 'border-gray-300'

&nbsp;      140 +              }`}

&nbsp;      141 +              placeholder="John Smith"

&nbsp;      142 +            />

&nbsp;      143 +            {errors.name \&\& <p className="mt-1 text-sm

&nbsp;          + text-red-600">{errors.name}</p>}

&nbsp;      144 +          </div>

&nbsp;      145

&nbsp;      146 -            {/\* Role \*/}

&nbsp;      147 -            <div>

&nbsp;      148 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">

&nbsp;      149 -                Role <span className="text-red-500

&nbsp;          -  ">\*</span>

&nbsp;      150 -              </label>

&nbsp;      151 -              <input

&nbsp;      152 -                type="text"

&nbsp;      153 -                name="role"

&nbsp;      154 -                value={formData.role}

&nbsp;      155 -                onChange={handleChange}

&nbsp;      156 -                className={`w-full px-3 py-2 border ${

&nbsp;      157 -                  errors.role ? 'border-red-500' :

&nbsp;          - 'border-gray-300'

&nbsp;      158 -                } rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500`}

&nbsp;      159 -              />

&nbsp;      160 -              {errors.role \&\& <p className="text-red-500

&nbsp;          - text-sm mt-1">{errors.role}</p>}

&nbsp;      161 -            </div>

&nbsp;      146 +          {/\* Role \*/}

&nbsp;      147 +          <div>

&nbsp;      148 +            <label htmlFor="role"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      149 +              Role <span className="text-red-600

&nbsp;          +  ">\*</span>

&nbsp;      150 +            </label>

&nbsp;      151 +            <input

&nbsp;      152 +              type="text"

&nbsp;      153 +              id="role"

&nbsp;      154 +              name="role"

&nbsp;      155 +              value={formData.role}

&nbsp;      156 +              onChange={handleChange}

&nbsp;      157 +              className={`w-full px-3 py-2 border

&nbsp;          + rounded-md focus:outline-none focus:ring-2

&nbsp;          + focus:ring-blue-500 ${

&nbsp;      158 +                errors.role ? 'border-red-500' :

&nbsp;          + 'border-gray-300'

&nbsp;      159 +              }`}

&nbsp;      160 +              placeholder="Portfolio Manager"

&nbsp;      161 +            />

&nbsp;      162 +            {errors.role \&\& <p className="mt-1 text-sm

&nbsp;          + text-red-600">{errors.role}</p>}

&nbsp;      163 +          </div>

&nbsp;      164

&nbsp;      165 -            {/\* Email \*/}

&nbsp;      166 -            <div>

&nbsp;      167 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">

&nbsp;      168 -                Email <span className="text-red-500

&nbsp;          -  ">\*</span>

&nbsp;      169 -              </label>

&nbsp;      170 -              <input

&nbsp;      171 -                type="email"

&nbsp;      172 -                name="email"

&nbsp;      173 -                value={formData.email}

&nbsp;      174 -                onChange={handleChange}

&nbsp;      175 -                className={`w-full px-3 py-2 border ${

&nbsp;      176 -                  errors.email ? 'border-red-500' :

&nbsp;          - 'border-gray-300'

&nbsp;      177 -                } rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500`}

&nbsp;      178 -              />

&nbsp;      179 -              {errors.email \&\& <p className="text-red-500

&nbsp;          -  text-sm mt-1">{errors.email}</p>}

&nbsp;      180 -            </div>

&nbsp;      165 +          {/\* Email \*/}

&nbsp;      166 +          <div>

&nbsp;      167 +            <label htmlFor="email"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      168 +              Email <span className="text-red-600

&nbsp;          +  ">\*</span>

&nbsp;      169 +            </label>

&nbsp;      170 +            <input

&nbsp;      171 +              type="email"

&nbsp;      172 +              id="email"

&nbsp;      173 +              name="email"

&nbsp;      174 +              value={formData.email}

&nbsp;      175 +              onChange={handleChange}

&nbsp;      176 +              className={`w-full px-3 py-2 border

&nbsp;          + rounded-md focus:outline-none focus:ring-2

&nbsp;          + focus:ring-blue-500 ${

&nbsp;      177 +                errors.email ? 'border-red-500' :

&nbsp;          + 'border-gray-300'

&nbsp;      178 +              }`}

&nbsp;      179 +              placeholder="john.smith@example.com"

&nbsp;      180 +            />

&nbsp;      181 +            {errors.email \&\& <p className="mt-1 text-sm

&nbsp;          + text-red-600">{errors.email}</p>}

&nbsp;      182 +          </div>

&nbsp;      183

&nbsp;      184 -            {/\* Phone \*/}

&nbsp;      185 -            <div>

&nbsp;      186 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">Phone</label>

&nbsp;      187 -              <input

&nbsp;      188 -                type="text"

&nbsp;      189 -                name="phone"

&nbsp;      190 -                value={formData.phone}

&nbsp;      191 -                onChange={handleChange}

&nbsp;      192 -                className="w-full px-3 py-2 border

&nbsp;          - border-gray-300 rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500"

&nbsp;      193 -              />

&nbsp;      194 -            </div>

&nbsp;      184 +          {/\* Phone \*/}

&nbsp;      185 +          <div>

&nbsp;      186 +            <label htmlFor="phone"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      187 +              Phone

&nbsp;      188 +            </label>

&nbsp;      189 +            <input

&nbsp;      190 +              type="tel"

&nbsp;      191 +              id="phone"

&nbsp;      192 +              name="phone"

&nbsp;      193 +              value={formData.phone}

&nbsp;      194 +              onChange={handleChange}

&nbsp;      195 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      196 +              placeholder="+1 234 567 8900"

&nbsp;      197 +            />

&nbsp;      198 +          </div>

&nbsp;      199

&nbsp;      200 -            {/\* LinkedIn \*/}

&nbsp;      201 -            <div>

&nbsp;      202 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">LinkedIn</label>

&nbsp;      203 -              <input

&nbsp;      204 -                type="text"

&nbsp;      205 -                name="linkedin"

&nbsp;      206 -                value={formData.linkedin}

&nbsp;      207 -                onChange={handleChange}

&nbsp;      208 -                className="w-full px-3 py-2 border

&nbsp;          - border-gray-300 rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500"

&nbsp;      209 -              />

&nbsp;      210 -            </div>

&nbsp;      200 +          {/\* LinkedIn \*/}

&nbsp;      201 +          <div>

&nbsp;      202 +            <label htmlFor="linkedin"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      203 +              LinkedIn URL

&nbsp;      204 +            </label>

&nbsp;      205 +            <input

&nbsp;      206 +              type="url"

&nbsp;      207 +              id="linkedin"

&nbsp;      208 +              name="linkedin"

&nbsp;      209 +              value={formData.linkedin}

&nbsp;      210 +              onChange={handleChange}

&nbsp;      211 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      212 +

&nbsp;          + placeholder="https://linkedin.com/in/johnsmith"

&nbsp;      213 +            />

&nbsp;      214 +          </div>

&nbsp;      215

&nbsp;      216 -            {/\* Relationship \*/}

&nbsp;      217 -            <div>

&nbsp;      218 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">Relationship</label>

&nbsp;      219 -              <select

&nbsp;      220 -                name="relationship"

&nbsp;      221 -                value={formData.relationship}

&nbsp;      222 -                onChange={handleChange}

&nbsp;      223 -                className="w-full px-3 py-2 border

&nbsp;          - border-gray-300 rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500"

&nbsp;      224 -              >

&nbsp;      225 -                {RELATIONSHIP\_LEVELS.map((level) => (

&nbsp;      226 -                  <option key={level} value={level}>

&nbsp;      227 -                    {level}

&nbsp;      228 -                  </option>

&nbsp;      229 -                ))}

&nbsp;      230 -              </select>

&nbsp;      231 -            </div>

&nbsp;      216 +          {/\* Relationship \*/}

&nbsp;      217 +          <div>

&nbsp;      218 +            <label htmlFor="relationship"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      219 +              Relationship Strength

&nbsp;      220 +            </label>

&nbsp;      221 +            <select

&nbsp;      222 +              id="relationship"

&nbsp;      223 +              name="relationship"

&nbsp;      224 +              value={formData.relationship}

&nbsp;      225 +              onChange={handleChange}

&nbsp;      226 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      227 +            >

&nbsp;      228 +              {RELATIONSHIP\_LEVELS.map(level => (

&nbsp;      229 +                <option key={level} value={level}>

&nbsp;      230 +                  {level}

&nbsp;      231 +                </option>

&nbsp;      232 +              ))}

&nbsp;      233 +            </select>

&nbsp;      234 +          </div>

&nbsp;      235

&nbsp;      236 -            {/\* DISC Profile \*/}

&nbsp;      237 -            <div>

&nbsp;      238 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">DISC Profile</label>

&nbsp;      239 -              <select

&nbsp;      240 -                name="disc\_profile"

&nbsp;      241 -                value={formData.disc\_profile}

&nbsp;      242 -                onChange={handleChange}

&nbsp;      243 -                className="w-full px-3 py-2 border

&nbsp;          - border-gray-300 rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500"

&nbsp;      244 -              >

&nbsp;      245 -                {DISC\_PROFILES.map((profile) => (

&nbsp;      246 -                  <option key={profile} value={profile}>

&nbsp;      247 -                    {profile || 'None'}

&nbsp;      248 -                  </option>

&nbsp;      249 -                ))}

&nbsp;      250 -              </select>

&nbsp;      251 -            </div>

&nbsp;      236 +          {/\* DISC Profile \*/}

&nbsp;      237 +          <div>

&nbsp;      238 +            <label htmlFor="disc\_profile"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      239 +              DISC Profile

&nbsp;      240 +            </label>

&nbsp;      241 +            <select

&nbsp;      242 +              id="disc\_profile"

&nbsp;      243 +              name="disc\_profile"

&nbsp;      244 +              value={formData.disc\_profile}

&nbsp;      245 +              onChange={handleChange}

&nbsp;      246 +              className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      247 +            >

&nbsp;      248 +              <option value="">Not specified</option>

&nbsp;      249 +              {DISC\_PROFILES.filter(p => p !==

&nbsp;          + '').map(profile => (

&nbsp;      250 +                <option key={profile} value={profile}>

&nbsp;      251 +                  {profile}

&nbsp;      252 +                </option>

&nbsp;      253 +              ))}

&nbsp;      254 +            </select>

&nbsp;      255 +          </div>

&nbsp;      256 +        </div>

&nbsp;      257

&nbsp;      258 -            {/\* Contact Notes \*/}

&nbsp;      259 -            <div>

&nbsp;      260 -              <label

&nbsp;          -  className="block text-sm font-medium text-gray-700

&nbsp;          -  mb-1">Contact Notes</label>

&nbsp;      261 -              <textarea

&nbsp;      262 -                name="contact\_notes"

&nbsp;      263 -                value={formData.contact\_notes}

&nbsp;      264 -                onChange={handleChange}

&nbsp;      265 -                rows={4}

&nbsp;      266 -                className="w-full px-3 py-2 border

&nbsp;          - border-gray-300 rounded-md focus:outline-none

&nbsp;          - focus:ring-2 focus:ring-blue-500"

&nbsp;      267 -              />

&nbsp;      268 -            </div>

&nbsp;      258 +        {/\* Contact Notes \*/}

&nbsp;      259 +        <div>

&nbsp;      260 +          <label htmlFor="contact\_notes"

&nbsp;          +  className="block text-sm font-medium text-gray-700

&nbsp;          +  mb-1">

&nbsp;      261 +            Notes

&nbsp;      262 +          </label>

&nbsp;      263 +          <textarea

&nbsp;      264 +            id="contact\_notes"

&nbsp;      265 +            name="contact\_notes"

&nbsp;      266 +            value={formData.contact\_notes}

&nbsp;      267 +            onChange={handleChange}

&nbsp;      268 +            rows={4}

&nbsp;      269 +            className="w-full px-3 py-2 border

&nbsp;          + border-gray-300 rounded-md focus:outline-none

&nbsp;          + focus:ring-2 focus:ring-blue-500"

&nbsp;      270 +            placeholder="Additional notes about this

&nbsp;          + contact..."

&nbsp;      271 +          />

&nbsp;      272 +        </div>

&nbsp;      273

&nbsp;      274 -            {/\* Buttons \*/}

&nbsp;      275 -            <div className="flex gap-3">

&nbsp;      276 -              <button

&nbsp;      277 -                type="submit"

&nbsp;      278 -                className="bg-blue-600 text-white px-6

&nbsp;          - py-2 rounded-md hover:bg-blue-700 transition-colors"

&nbsp;      279 -              >

&nbsp;      280 -                {initialData ? 'Update Contact' : 'Create

&nbsp;          -  Contact'}

&nbsp;      281 -              </button>

&nbsp;      282 -              <button

&nbsp;      283 -                type="button"

&nbsp;      284 -                onClick={onCancel}

&nbsp;      285 -                className="bg-gray-200 text-gray-700 px-6

&nbsp;          -  py-2 rounded-md hover:bg-gray-300 transition-colors"

&nbsp;      286 -              >

&nbsp;      287 -                Cancel

&nbsp;      288 -              </button>

&nbsp;      289 -            </div>

&nbsp;      290 -          </>

&nbsp;      291 -        )}

&nbsp;      274 +        {/\* Form Actions \*/}

&nbsp;      275 +        <div className="flex gap-3 justify-end pt-4

&nbsp;          + border-t border-gray-200">

&nbsp;      276 +          <button

&nbsp;      277 +            type="button"

&nbsp;      278 +            onClick={onCancel}

&nbsp;      279 +            className="px-6 py-2 bg-gray-200

&nbsp;          + text-gray-800 rounded-md hover:bg-gray-300

&nbsp;          + transition-colors"

&nbsp;      280 +          >

&nbsp;      281 +            Cancel

&nbsp;      282 +          </button>

&nbsp;      283 +          <button

&nbsp;      284 +            type="submit"

&nbsp;      285 +            className="px-6 py-2 bg-blue-600 text-white

&nbsp;          + rounded-md hover:bg-blue-700 transition-colors"

&nbsp;      286 +          >

&nbsp;      287 +            {initialData ? 'Save Changes' : 'Create

&nbsp;          + Contact'}

&nbsp;      288 +          </button>

&nbsp;      289 +        </div>

&nbsp;      290        </form>

&nbsp;      291      );

&nbsp;      292    };

&nbsp; ⎿  Session limit reached ∙ resets 7pm

&nbsp;    /upgrade to increase your usage limit.



&nbsp; Todos

&nbsp; ☒ Fix Capital Partners Table View to work with Partner > Contact structure

&nbsp; ☒ Update CapitalPartnerForm to add preferences and investment ranges

&nbsp; ☐ Update ContactForm to work in modal

&nbsp; ☐ Update CapitalPartnersList to use modal flow

