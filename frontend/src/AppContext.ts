import type { AppContextType } from './internal/appContextType';

import { createContext } from 'react';

const AppContext = createContext<AppContextType>({} as AppContextType);

export default AppContext;
