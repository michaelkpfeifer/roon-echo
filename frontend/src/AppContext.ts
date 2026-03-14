import { createContext } from 'react';

import type { AppContextType } from './internal/appContextType';

const AppContext = createContext<AppContextType>({} as AppContextType);

export default AppContext;
